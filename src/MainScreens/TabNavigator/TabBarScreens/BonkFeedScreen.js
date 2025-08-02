import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Easing,
  ScrollView,
  Share,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import enndpoint from '../../../../constants/enndpoint';
import { launchImageLibrary } from 'react-native-image-picker';
import CommentModal from '../../../components/CommentModal/CommentModal';
import { AuthContext } from '../../../persistence/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_IDENTITY } from '../../../Auth/providers/AuthorizationProvider';
import { getPublicKeyFromAddress } from '../../../../utils/getPublicKeyFromAddress';

import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from '@solana/spl-token';

const { width } = Dimensions.get('window');

// BONK Token Configuration
const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
const BONK_DECIMALS = 5;
const SOLANA_NETWORK = 'mainnet-beta';

// Enhanced RPC Configuration for better reliability
const RPC_ENDPOINTS = [
  process.env.REACT_APP_RPC_URL,
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
  'https://mainnet.helius-rpc.com/?api-key=your-helius-key',
  clusterApiUrl(SOLANA_NETWORK)
].filter(Boolean);

// Web3 Color Palette
const web3Colors = {
  background: '#0A0B0E',
  cardBg: 'rgba(17, 18, 28, 0.8)',
  text: '#FFFFFF',
  textSecondary: '#8B8CA7',
  primary: '#9445FF',
  secondary: '#00D4FF',
  accent: '#FF6B6B',
  success: '#4ECDC4',
  gradient1: '#9445FF',
  gradient2: '#00D4FF',
  gradient3: '#FF6B6B',
  border: 'rgba(148, 69, 255, 0.2)',
  glassOverlay: 'rgba(255, 255, 255, 0.1)',
  darkOverlay: 'rgba(0, 0, 0, 0.6)',
  bonk: '#FF6B35',
  warning: '#FFB800',
};

/**
 * Enhanced Connection Manager for better RPC reliability
 */


const createReliableConnection = async () => {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      console.log(`Testing RPC endpoint: ${endpoint}`);
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
        wsEndpoint: endpoint.replace('https://', 'wss://').replace('http://', 'ws://'),
      });
      
      const slot = await connection.getSlot();
      console.log(`✅ RPC endpoint ${endpoint} is working. Current slot: ${slot}`);
      return connection;
    } catch (error) {
      console.log(`❌ RPC endpoint ${endpoint} failed:`, error.message);
      continue;
    }
  }
  throw new Error('All RPC endpoints are unavailable');
};

/**
 * Wallet validation utility
 */
const validateWalletAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  
  try {
    const cleanAddress = address.trim();
    if (cleanAddress.length < 32 || cleanAddress.length > 44) return false;
    new PublicKey(cleanAddress);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert various wallet address formats to PublicKey
 */
const convertToPublicKey = (walletAddress) => {
  if (!walletAddress) return null;
  
  try {
    let cleanAddress = walletAddress.trim();
    
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanAddress) && cleanAddress.includes('=')) {
      const binaryString = atob(cleanAddress);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new PublicKey(bytes);
    } else if (cleanAddress instanceof Uint8Array || Buffer.isBuffer(cleanAddress)) {
      return new PublicKey(cleanAddress);
    } else if (Array.isArray(cleanAddress)) {
      return new PublicKey(new Uint8Array(cleanAddress));
    } else if (typeof cleanAddress === 'string') {
      return new PublicKey(cleanAddress);
    }
    
    return null;
  } catch (error) {
    console.log('Error converting wallet address:', error);
    return null;
  }
};

/**
 * Enhanced BONK Balance Hook with proper wallet tracking
 */
const useBonkBalance = (publicKey, walletAddress) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);

  const fetchBalance = useCallback(async (forceRefresh = false) => {
    if (!publicKey) {
      setBalance(null);
      setCurrentWallet(null);
      return;
    }

    const walletKey = publicKey.toBase58();
    
    if (currentWallet && currentWallet !== walletKey) {
      console.log('Wallet mismatch during fetch, aborting');
      return;
    }

    const isStale = lastFetched && (Date.now() - lastFetched) > 15000;
    if (!forceRefresh && balance !== null && !isStale && currentWallet === walletKey) {
      console.log('Using cached balance');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching REAL BONK balance for wallet:', walletKey.slice(0, 8) + '...');
      
      const connection = await createReliableConnection();
      const bonkMint = new PublicKey(BONK_MINT_ADDRESS);
      const associatedTokenAddress = await getAssociatedTokenAddress(bonkMint, publicKey);
      
      try {
        const account = await getAccount(connection, associatedTokenAddress);
        const tokenBalance = Number(account.amount) / Math.pow(10, BONK_DECIMALS);
        
        if (currentWallet === walletKey) {
          console.log('Real BONK balance fetched:', tokenBalance.toLocaleString());
          setBalance(tokenBalance);
          setLastFetched(Date.now());
        }
      } catch (err) {
        if (err instanceof TokenAccountNotFoundError) {
          console.log('No BONK token account found - balance is 0');
          if (currentWallet === walletKey) {
            setBalance(0);
            setLastFetched(Date.now());
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.log("Error fetching balance:", err);
      
      if (currentWallet === walletKey) {
        if (err.message && err.message.includes('429')) {
          setError(new Error('Rate limited - please wait before refreshing'));
        } else {
          setError(err instanceof Error ? err : new Error('Failed to fetch BONK balance'));
        }
        
        if (balance === null) {
          setBalance(0);
        }
      }
    } finally {
      if (currentWallet === walletKey) {
        setLoading(false);
      }
    }
  }, [publicKey, balance, lastFetched, currentWallet]);

  // Reset balance when wallet changes
  useEffect(() => {
    const walletKey = publicKey?.toBase58() || walletAddress;
    
    if (walletKey !== currentWallet) {
      console.log('Wallet changed, resetting balance');
      setCurrentWallet(walletKey);
      setBalance(null);
      setLastFetched(null);
      setError(null);
      setLoading(false);
      
      if (publicKey) {
        fetchBalance(true);
      }
    }
  }, [publicKey, walletAddress]);

  const refreshAfterTransaction = useCallback(async () => {
    console.log('Refreshing balance after transaction...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await fetchBalance(true);
  }, [fetchBalance]);

  return { 
    balance, 
    loading, 
    error, 
    fetchBalance, 
    lastFetched, 
    refreshAfterTransaction,
    currentWallet 
  };
};

/**
 * STREAMLINED BONK Transfer Function - Uses existing wallet session
 */
const executeStreamlinedBonkTransfer = async (
  fromWallet,
  toWallet,
  amount,
  connection
) => {
  try {
    console.log('🚀 Starting BONK transfer with session validation:', { 
      from: fromWallet.toBase58(), 
      to: toWallet.toBase58(), 
      amount: amount.toLocaleString()
    });
    
    const bonkMint = new PublicKey(BONK_MINT_ADDRESS);
    
    // Get associated token addresses
    const fromTokenAccount = await getAssociatedTokenAddress(bonkMint, fromWallet);
    const toTokenAccount = await getAssociatedTokenAddress(bonkMint, toWallet);
    
    console.log('📍 Token accounts:', {
      from: fromTokenAccount.toBase58(),
      to: toTokenAccount.toBase58()
    });
    
    // Verify sender has sufficient balance
    try {
      const senderAccount = await getAccount(connection, fromTokenAccount);
      const senderBalance = Number(senderAccount.amount) / Math.pow(10, BONK_DECIMALS);
      
      if (senderBalance < amount) {
        throw new Error(`Insufficient balance: ${senderBalance.toLocaleString()} < ${amount.toLocaleString()}`);
      }
      
      console.log('✅ Sender balance verified:', senderBalance.toLocaleString(), 'BONK');
    } catch (err) {
      if (err instanceof TokenAccountNotFoundError) {
        throw new Error('Sender does not have a BONK token account');
      }
      throw err;
    }
    
    // Create transaction
    const transaction = new Transaction();
    
    // Check if recipient token account exists
    let toAccountExists = true;
    try {
      await getAccount(connection, toTokenAccount);
      console.log('✅ Recipient token account exists');
    } catch (err) {
      if (err instanceof TokenAccountNotFoundError) {
        toAccountExists = false;
        console.log('⚠️ Recipient token account does not exist, will create');
      } else {
        throw err;
      }
    }
    
    // If recipient token account doesn't exist, create it
    if (!toAccountExists) {
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        fromWallet, // payer
        toTokenAccount, // associated token account address
        toWallet, // wallet address
        bonkMint // mint
      );
      transaction.add(createAccountInstruction);
      console.log('📝 Added create token account instruction');
    }
    
    // Convert amount to token units (multiply by decimals)
    const tokenAmount = Math.floor(amount * Math.pow(10, BONK_DECIMALS));
    console.log('💱 Token amount in base units:', tokenAmount.toLocaleString());
    
    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      fromTokenAccount, // source
      toTokenAccount, // destination
      fromWallet, // owner of source account
      tokenAmount // amount in token units
    );
    
    transaction.add(transferInstruction);
    console.log('📝 Added transfer instruction');
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromWallet;
    
    console.log('🔐 Transaction prepared, signing with wallet...');
    
    // FIXED: Properly handle wallet session and auth token renewal
    let signedTx;
    try {
      signedTx = await transact(async (wallet) => {
        console.log('📱 Requesting fresh authorization and signature...');
        
        // IMPORTANT: Request fresh authorization for signing
        // This ensures the auth token is valid
        const authResult = await wallet.authorize({
          cluster: SOLANA_NETWORK,
          identity: APP_IDENTITY,
        });
        
        console.log('✅ Fresh authorization obtained:', authResult.auth_token ? 'Token valid' : 'No token');
        
        // Now sign the transaction with the fresh session
        const signResult = await wallet.signTransactions({
          transactions: [transaction],
        });
        
        console.log('✅ Transaction signed successfully');
        return signResult.signedTransactions[0];
      });
      
      console.log('✅ Transaction signed with renewed session');
    } catch (signError) {
      console.log('❌ Transaction signing failed:', signError);
      
      // Enhanced error handling for common wallet issues
      if (signError.message && signError.message.includes('User rejected')) {
        throw new Error('Transaction was cancelled by user.');
      } else if (signError.message && signError.message.includes('auth_token not valid')) {
        throw new Error('Wallet session expired. Please close and reopen the app, then try again.');
      } else if (signError.message && signError.message.includes('session expired')) {
        throw new Error('Wallet session expired. Please reconnect your wallet and try again.');
      } else if (signError.message && signError.message.includes('User declined authorization')) {
        throw new Error('Wallet authorization was declined. Please try again and approve the request.');
      } else if (signError.message && signError.message.includes('No wallet selected')) {
        throw new Error('No wallet was selected. Please select a wallet and try again.');
      }
      
      throw new Error(`Failed to sign transaction: ${signError.message}`);
    }
    
    // Send transaction
    let signature;
    try {
      signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
      console.log('📤 Transaction sent with signature:', signature);
    } catch (sendError) {
      console.log('❌ Failed to send transaction:', sendError);
      throw new Error(`Failed to send transaction: ${sendError.message}`);
    }
    
    // Wait for confirmation with timeout
    console.log('⏳ Waiting for blockchain confirmation...');
    try {
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed on blockchain: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log('✅ BONK transfer confirmed on blockchain!');
      
    } catch (confirmError) {
      console.log('❌ Transaction confirmation failed:', confirmError);
      
      // Even if confirmation fails, the transaction might still succeed
      try {
        const txStatus = await connection.getSignatureStatus(signature);
        if (txStatus.value && !txStatus.value.err) {
          console.log('✅ Transaction succeeded despite confirmation timeout');
        } else {
          throw new Error('Transaction failed or timed out');
        }
      } catch (statusError) {
        throw new Error(`Transaction confirmation failed: ${confirmError.message}`);
      }
    }
    
    return {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}`,
      message: 'BONK transfer completed successfully on blockchain'
    };
    
  } catch (error) {
    console.log('💥 BONK transfer failed:', error);
    throw error;
  }
};


/**
 * Streamlined Wallet Provider - Uses existing authentication
 */
const useStreamlinedWallet = () => {
  const [isReady, setIsReady] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [lastAuthCheck, setLastAuthCheck] = useState(null);
  const { user, walletInfo } = useContext(AuthContext);

  // Initialize from existing authentication
  useEffect(() => {
    const initializeWallet = () => {
      console.log('🔄 Initializing streamlined wallet from existing auth...');
      
      // Get wallet address from authenticated user
      const walletAddress = user?.walletAddress || walletInfo?.address;
      
      if (walletAddress && validateWalletAddress(walletAddress)) {
        const publicKey = convertToPublicKey(walletAddress);
        if (publicKey) {
          setPublicKey(publicKey);
          setIsConnected(true);
          setIsReady(true);
          setLastAuthCheck(Date.now());
          console.log('✅ Streamlined wallet ready:', publicKey.toBase58().slice(0, 8) + '...');
        } else {
          setSessionError('Invalid wallet address format');
          console.log('❌ Invalid wallet address format');
        }
      } else {
        setSessionError('No valid wallet address found in authentication');
        console.log('❌ No wallet address found in user auth');
      }
    };

    initializeWallet();
  }, [user, walletInfo]);

  const refreshConnection = useCallback(async () => {
    try {
      setSessionError(null);
      
      // Check if we need to validate wallet session
      const timeSinceLastCheck = lastAuthCheck ? Date.now() - lastAuthCheck : Infinity;
      const sessionStale = timeSinceLastCheck > 300000; // 5 minutes
      
      if (sessionStale) {
        console.log('🔄 Session may be stale, checking wallet connectivity...');
        
        // Test wallet connection by requesting authorization
        try {
          await transact(async (wallet) => {
            const authResult = await wallet.authorize({
              cluster: SOLANA_NETWORK,
              identity: APP_IDENTITY,
            });
            console.log('✅ Wallet session validated');
            return authResult;
          });
          setLastAuthCheck(Date.now());
        } catch (authError) {
          console.warn('⚠️ Wallet session validation failed:', authError.message);
          setSessionError('Wallet session may be expired. Try sending a gift to refresh.');
        }
      }
      
      // Re-initialize from auth context
      const walletAddress = user?.walletAddress || walletInfo?.address;
      if (walletAddress) {
        const publicKey = convertToPublicKey(walletAddress);
        if (publicKey) {
          setPublicKey(publicKey);
          setIsConnected(true);
          setIsReady(true);
          console.log('🔄 Wallet connection refreshed');
        }
      }
    } catch (error) {
      setSessionError(error.message);
      console.log('Failed to refresh wallet connection:', error);
    }
  }, [user, walletInfo, lastAuthCheck]);

  // Periodic session health check
  useEffect(() => {
    if (isReady && isConnected) {
      const interval = setInterval(() => {
        const timeSinceLastCheck = lastAuthCheck ? Date.now() - lastAuthCheck : Infinity;
        if (timeSinceLastCheck > 600000) { // 10 minutes
          console.log('🔍 Performing periodic wallet session check...');
          refreshConnection();
        }
      }, 300000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [isReady, isConnected, lastAuthCheck, refreshConnection]);

  return {
    isReady,
    publicKey,
    isConnected,
    sessionError,
    refreshConnection,
    walletAddress: user?.walletAddress || walletInfo?.address,
    sessionHealthy: lastAuthCheck && (Date.now() - lastAuthCheck) < 300000
  };
};


const getValidUserId = (user, walletInfo) => {
  const possibleIds = [
    user?.id,
    user?.uid,
    user?.userId,
    walletInfo?.userId,
    walletInfo?.id,
  ];
  
  for (const id of possibleIds) {
    if (id && typeof id === 'string' && id !== 'undefined' && id !== 'null') {
      return id;
    }
  }
  
  if (user?.email) return user.email;
  if (walletInfo?.address) return `wallet_${walletInfo.address.slice(-8)}`;
  
  return `temp_user_${Date.now()}`;
};

const BonkFeedScreen = () => {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [animatedScales, setAnimatedScales] = useState({});
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { user, walletInfo } = useContext(AuthContext);
  
  // Use streamlined wallet approach
  const { 
    isReady: walletReady,
    publicKey: userPublicKey,
    isConnected,
    sessionError,
    refreshConnection,
    walletAddress
  } = useStreamlinedWallet();
  
  // Get user's BONK balance with real blockchain data
  const { 
    balance: userBonkBalance, 
    loading: balanceLoading, 
    fetchBalance,
    refreshAfterTransaction,
    currentWallet
  } = useBonkBalance(userPublicKey, walletAddress);

  const fetchNewsFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${enndpoint.main}/api/newsfeed/all`);
      if (res.data && Array.isArray(res.data.posts)) {
        setNewsFeed(res.data.posts);
      } else {
        Alert.alert('Error', 'Invalid data received from server.');
        setNewsFeed([]);
      }
    } catch (err) {
      console.log('Fetch News Feed Error:', err);
      Alert.alert('Error', 'Failed to fetch news feed. Please try again.');
      setNewsFeed([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsFeed();
  }, []);

  const isCurrentUserPost = (post) => {
    const currentUserId = getValidUserId(user, walletInfo);
    const currentUserWallet = user?.walletAddress || walletInfo?.address;
    
    const normalizeWallet = (wallet) => {
      if (!wallet) return null;
      try {
        const publicKey = convertToPublicKey(wallet);
        return publicKey ? publicKey.toBase58() : null;
      } catch {
        return null;
      }
    };
    
    const currentWalletNormalized = normalizeWallet(currentUserWallet);
    const postWalletNormalized = normalizeWallet(post.owner?.walletAddress || post.userWallet);
    
    const postOwnerId = post.userId || post.owner?.uid || post.owner?.id;
    
    return currentUserId === postOwnerId || 
           (currentWalletNormalized && postWalletNormalized && currentWalletNormalized === postWalletNormalized);
  };

  const hasValidWallet = (post) => {
    const recipientWallet = post.owner?.walletAddress || post.userWallet;
    return validateWalletAddress(recipientWallet);
  };

  const openGiftModal = (post) => {
    if (!walletReady || !userPublicKey) {
      Alert.alert(
        'Wallet Not Ready', 
        sessionError || 'Your wallet is not properly connected. Please refresh the app and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Refresh', onPress: refreshConnection }
        ]
      );
      return;
    }
    
    if (isCurrentUserPost(post)) {
      Alert.alert(
        'Cannot Gift Own Post', 
        'You cannot send a gift to your own post. Share it with others to receive gifts!',
        [{ text: 'Got it', style: 'default' }]
      );
      return;
    }

    if (!hasValidWallet(post)) {
      Alert.alert(
        'Invalid Recipient Wallet', 
        'The post owner does not have a valid Solana wallet address.',
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    setSelectedPost(post);
    setSelectedPostId(post.id);
    setGiftModalVisible(true);
  };

  /**
   * STREAMLINED BONK Gift Handler - No fresh wallet connection needed
   */
const handleStreamlinedSendGift = async () => {
  if (!giftAmount || isNaN(giftAmount) || parseFloat(giftAmount) <= 0) {
    Alert.alert('Invalid Amount', 'Please enter a valid BONK amount greater than 0.');
    return;
  }

  if (!userPublicKey || !walletReady) {
    Alert.alert(
      'Wallet Not Ready', 
      'Your wallet is not properly connected. Please refresh the connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Refresh', onPress: refreshConnection }
      ]
    );
    return;
  }

  if (!selectedPost) {
    Alert.alert('Error', 'Post information not found.');
    return;
  }

  const amount = parseFloat(giftAmount);

  // Refresh balance before checking
  console.log('🔄 Refreshing balance before gift...');
  await fetchBalance(true);

  if (userBonkBalance === null) {
    Alert.alert('Balance Error', 'Unable to fetch your BONK balance. Please refresh.');
    return;
  }

  if (userBonkBalance < amount) {
    Alert.alert(
      'Insufficient Balance', 
      `You need ${amount.toLocaleString()} BONK but only have ${userBonkBalance.toLocaleString()} BONK.`
    );
    return;
  }

  try {
    setGiftLoading(true);

    const recipientWalletAddress = selectedPost.owner?.walletAddress || selectedPost.userWallet;
    const recipientId = selectedPost.userId || selectedPost.owner?.uid || selectedPost.owner?.id;

    console.log('🎁 Preparing BONK gift with session validation:', {
      recipient: recipientWalletAddress,
      amount: amount.toLocaleString(),
      post: selectedPostId
    });

    if (!validateWalletAddress(recipientWalletAddress)) {
      throw new Error('Invalid recipient wallet address');
    }

    const recipientPublicKey = convertToPublicKey(recipientWalletAddress);
    if (!recipientPublicKey) {
      throw new Error('Cannot convert recipient wallet to PublicKey');
    }

    const senderId = getValidUserId(user, walletInfo);

    // Create gift record in database
    const giftData = {
      senderId: senderId,
      senderWallet: userPublicKey.toBase58(),
      recipientId: recipientId,
      recipientWallet: recipientPublicKey.toBase58(),
      postId: selectedPostId,
      amount: amount,
      token: 'BONK',
      senderBalanceAtTime: userBonkBalance,
      status: 'pending'
    };

    console.log('📝 Creating gift record in database...');
    const giftResponse = await axios.post(
      `${enndpoint.main}/api/gifts/create`, 
      giftData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    
    if (!giftResponse.data.success) {
      throw new Error(giftResponse.data.message || 'Failed to create gift record');
    }
    
    const giftId = giftResponse.data.giftId;
    console.log('✅ Gift record created with ID:', giftId);

    // Get reliable connection
    const connection = await createReliableConnection();
    
    // Execute FIXED blockchain transfer with proper session handling
    console.log('🚀 Executing blockchain transfer with session validation...');
    
    const transferResult = await executeStreamlinedBonkTransfer(
      userPublicKey,
      recipientPublicKey,
      amount,
      connection
    );

    if (transferResult.success) {
      console.log('✅ Blockchain transfer successful:', transferResult.signature);
      
      // Update gift record with transaction signature
      const completeData = {
        giftId: giftId,
        transactionSignature: transferResult.signature,
        explorerUrl: transferResult.explorerUrl
      };

      console.log('📝 Completing gift record...');
      const completeResponse = await axios.post(
        `${enndpoint.main}/api/gifts/complete`, 
        completeData
      );
      
      if (completeResponse.data.success) {
        // Refresh balance from blockchain
        console.log('🔄 Refreshing balance after successful transaction...');
        await refreshAfterTransaction();
        
        // Update UI
        updatePostGifts(amount);
        
        // Show success
        Alert.alert(
          '🎉 BONK Gift Sent Successfully!',
          `${amount.toLocaleString()} BONK sent to @${selectedPost.owner?.username || 'Anonymous'}!\n\n✅ Confirmed on Solana blockchain`,
          [
            { text: 'View on Explorer', onPress: () => {
              if (Platform.OS === 'web') {
                window.open(transferResult.explorerUrl, '_blank');
              } else {
                Linking.openURL(transferResult.explorerUrl);
              }
            }},
            { text: 'Done', onPress: () => {
              setGiftModalVisible(false);
              setGiftAmount('');
              setSelectedPost(null);
            }}
          ]
        );
        
        console.log('🎉 BONK gift completed successfully!');
      }
    }

  } catch (error) {
    console.log('💥 BONK gift failed:', error);
    
    let errorMessage = 'Failed to send BONK gift. Please try again.';
    
    if (error.message.includes('User rejected') || error.message.includes('cancelled')) {
      errorMessage = 'Transaction was cancelled by user.';
    } else if (error.message.includes('Insufficient balance')) {
      errorMessage = error.message;
    } else if (error.message.includes('auth_token not valid') || error.message.includes('session expired')) {
      errorMessage = 'Wallet session expired. Please close and reopen the app, then try again.';
    } else if (error.message.includes('User declined authorization')) {
      errorMessage = 'Wallet authorization was declined. Please try again and approve the request.';
    } else if (error.message.includes('No wallet selected')) {
      errorMessage = 'No wallet was selected. Please select a wallet and try again.';
    }

    Alert.alert('Gift Failed', errorMessage);
    await refreshAfterTransaction();
    
  } finally {
    setGiftLoading(false);
  }
};

  const updatePostGifts = (amount) => {
    setNewsFeed(prevFeed => 
      prevFeed.map(post => {
        if (post.id === selectedPostId) {
          const currentGifts = Array.isArray(post.gifts) ? post.gifts : [];
          return {
            ...post,
            gifts: [...currentGifts, { 
              amount, 
              token: 'BONK', 
              userId: getValidUserId(user, walletInfo),
              senderName: user?.username || user?.displayName || 'Anonymous',
              timestamp: new Date().toISOString()
            }]
          };
        }
        return post;
      })
    );
  };

  const pickMedia = async () => {
    launchImageLibrary(
      { mediaType: 'mixed', selectionLimit: 5 },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Media selection failed.');
          return;
        }
        const assets = response.assets || [];
        if (assets.length > 0) {
          setSelectedMedia(assets);
        }
      },
    );
  };

  const handleCreatePost = async () => {
    if (!caption || selectedMedia.length === 0) {
      Alert.alert('Missing fields', 'Caption and media are required.');
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        userId: getValidUserId(user, walletInfo),
        caption,
        mediaItems: selectedMedia.map(media => ({
          url: media.uri,
          type: media.type,
        })),
      };

      await axios.post(`${enndpoint.main}/api/newsfeed/create`, postData);
      setShowModal(false);
      setCaption('');
      setSelectedMedia([]);
      fetchNewsFeed();
    } catch (error) {
      let errorMessage = 'Failed to create newsfeed post.';
      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message || JSON.stringify(error.response.data);
        errorMessage = `Server Error (${status}): ${backendMessage}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = `Unexpected error: ${error.message}`;
      }

      console.log('Create Post Error:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async postId => {
    if (likedPosts[postId]) return;

    const newScale = new Animated.Value(0);
    setAnimatedScales(prev => ({ ...prev, [postId]: newScale }));

    try {
      setLikedPosts(prev => ({ ...prev, [postId]: true }));

      Animated.sequence([
        Animated.timing(newScale, {
          toValue: 1.8,
          duration: 250,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(newScale, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      await axios.post(`${enndpoint.main}/api/newsfeed/${postId}/like`, {
        userId: getValidUserId(user, walletInfo),
      });

      setNewsFeed(prevFeed => 
        prevFeed.map(post => {
          if (post.id === postId) {
            const currentLikes = Array.isArray(post.likes) ? post.likes : [];
            return {
              ...post,
              likes: [...currentLikes, { userId: getValidUserId(user, walletInfo) }]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.log('Error liking post:', error.message);
      setLikedPosts(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = async postId => {
    try {
      const postLink = `https://your-app.com/posts/${postId}`;
      const result = await Share.share({
        message: `🔥 Check out this Web3 post and send some BONK! ${postLink}`,
        url: postLink,
        title: '🚀 Check out this BONK-powered post!',
      });

      if (result.action === Share.sharedAction) {
        console.log('Post shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share the post.');
      console.log('Share Error:', error);
    }
  };

  const renderMedia = mediaItems => {
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) return null;

    if (mediaItems.length === 1) {
      const media = mediaItems[0];
      const isImage = media.type?.startsWith('image');

      return isImage ? (
        <Image
          source={{ uri: media.url }}
          style={styles.singleMedia}
          resizeMode="cover"
        />
      ) : (
        <Video
          source={{ uri: media.url }}
          style={styles.singleMedia}
          controls
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.mediaGrid}>
        {mediaItems.map((media, index) => (
          <View key={index} style={styles.gridItem}>
            {media.type?.startsWith('image') ? (
              <Image
                source={{ uri: media.url }}
                style={styles.gridMedia}
                resizeMode="cover"
              />
            ) : (
              <Video
                source={{ uri: media.url }}
                style={styles.gridMedia}
                resizeMode="cover"
                repeat
                muted
                paused={true}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const WalletAddress = ({ address, isValid }) => (
    <View style={styles.walletContainer}>
      <MaterialCommunityIcons 
        name={isValid ? "wallet" : "wallet-outline"} 
        size={12} 
        color={isValid ? web3Colors.success : web3Colors.warning} 
      />
      <Text style={[
        styles.walletText,
        { color: isValid ? web3Colors.success : web3Colors.warning }
      ]}>
        {address && isValid 
          ? `${address.slice(0, 4)}...${address.slice(-4)}` 
          : 'Invalid wallet'
        }
      </Text>
      {!isValid && address && (
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={12} 
          color={web3Colors.warning} 
        />
      )}
    </View>
  );

  const StreamlinedWalletStatus = () => {
    return (
      <View style={styles.walletStatusContainer}>
        <View style={[
          styles.walletStatusBadge,
          { 
            backgroundColor: walletReady && isConnected 
              ? 'rgba(78, 205, 196, 0.1)' 
              : sessionError 
                ? 'rgba(255, 107, 107, 0.1)' 
                : 'rgba(255, 184, 0, 0.1)',
            borderColor: walletReady && isConnected 
              ? web3Colors.success
              : sessionError 
                ? web3Colors.accent
                : web3Colors.warning
          }
        ]}>
          <MaterialCommunityIcons 
            name={walletReady && isConnected ? "wallet-check" : sessionError ? "wallet-remove" : "wallet-outline"}
            size={16} 
            color={walletReady && isConnected 
              ? web3Colors.success
              : sessionError 
                ? web3Colors.accent
                : web3Colors.warning}
          />
          <Text style={[
            styles.walletStatusText,
            { color: walletReady && isConnected 
                ? web3Colors.success
                : sessionError 
                  ? web3Colors.accent
                  : web3Colors.warning }
          ]}>
            {walletReady && isConnected && userPublicKey
              ? `${userPublicKey.toBase58().slice(0, 4)}...${userPublicKey.toBase58().slice(-4)}`
              : sessionError
                ? 'Wallet Error'
                : 'Connecting...'
            }
          </Text>
        </View>
        
        {walletReady && isConnected && (
          <View style={styles.connectedInfo}>
            <View style={styles.bonkBalanceDisplay}>
              <MaterialCommunityIcons name="dog" size={14} color={web3Colors.bonk} />
              <Text style={styles.bonkBalanceText}>
                {balanceLoading ? 'Loading...' : 
                 userBonkBalance !== null ? `${userBonkBalance.toLocaleString()}` : '0'} BONK
              </Text>
              <TouchableOpacity 
                style={styles.balanceRefreshButton}
                onPress={() => fetchBalance(true)}
                disabled={balanceLoading}
              >
                <Ionicons 
                  name="refresh" 
                  size={12} 
                  color={web3Colors.primary} 
                  style={balanceLoading ? { opacity: 0.5 } : {}}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.walletSessionText}>
              Authenticated • Ready to send BONK
            </Text>
          </View>
        )}
        
        {sessionError && (
          <View style={styles.errorContainer}>
            <Text style={styles.walletErrorText}>{sessionError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={refreshConnection}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderBalanceWithRefresh = () => (
    <View style={styles.giftBalanceRow}>
      <MaterialCommunityIcons name="dog" size={24} color={web3Colors.bonk} />
      <Text style={styles.giftBalanceAmount}>
        {!userPublicKey ? 'Wallet not ready' :
         balanceLoading ? 'Refreshing...' : 
         userBonkBalance !== null ? `${userBonkBalance.toLocaleString()}` : '0'}
      </Text>
      <TouchableOpacity 
        style={styles.balanceRefreshButton}
        onPress={() => fetchBalance(true)}
        disabled={balanceLoading || !userPublicKey}
      >
        <Ionicons 
          name="refresh" 
          size={16} 
          color={userPublicKey ? web3Colors.primary : web3Colors.textSecondary} 
          style={balanceLoading ? { transform: [{ rotate: '180deg' }] } : {}}
        />
      </TouchableOpacity>
    </View>
  );

  const handleGiftAmountChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }
    
    if (parts[1] && parts[1].length > BONK_DECIMALS) {
      parts[1] = parts[1].substring(0, BONK_DECIMALS);
    }
    
    const finalValue = parts.join('.');
    setGiftAmount(finalValue);
  };

  const setMaxGiftAmount = () => {
    if (userBonkBalance && userBonkBalance > 0) {
      const maxAmount = Math.max(0, userBonkBalance - 0.001);
      setGiftAmount(maxAmount.toString());
    }
  };

  const renderItem = ({ item }) => {
    const isOwnPost = isCurrentUserPost(item);
    const hasWallet = hasValidWallet(item);
    const canReceiveGifts = !isOwnPost && hasWallet;
    const walletAddress = item.owner?.walletAddress || item.userWallet;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={isOwnPost 
                  ? [web3Colors.success, web3Colors.secondary] 
                  : hasWallet
                  ? [web3Colors.gradient1, web3Colors.gradient2]
                  : [web3Colors.warning, web3Colors.accent]
                }
                style={styles.avatarGradient}
              >
                <View style={styles.avatar}>
                  <MaterialCommunityIcons 
                    name={isOwnPost 
                      ? "account-check" 
                      : hasWallet 
                      ? "account" 
                      : "account-alert"
                    } 
                    size={24} 
                    color={web3Colors.text} 
                  />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.userDetails}>
              <View style={styles.userNameRow}>
                <Text style={styles.userNameText}>
                  {item.owner?.username || item.userDisplayName || item.userName || 'Anonymous'}
                </Text>
                {isOwnPost && (
                  <View style={styles.ownPostBadge}>
                    <MaterialCommunityIcons name="check-circle" size={10} color="white" />
                    <Text style={styles.ownPostBadgeText}>YOU</Text>
                  </View>
                )}
                {!hasWallet && !isOwnPost && (
                  <View style={styles.invalidWalletBadge}>
                    <MaterialCommunityIcons name="alert" size={10} color="white" />
                    <Text style={styles.invalidWalletBadgeText}>NO WALLET</Text>
                  </View>
                )}
              </View>
              <WalletAddress address={walletAddress} isValid={hasWallet} />
              <Text style={styles.postTimeText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.networkBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={12} color={web3Colors.accent} />
            <Text style={styles.networkText}>SOL</Text>
          </View>
        </View>
        
        <Text style={styles.captionText}>{item.caption}</Text>
        {renderMedia(item.mediaItems)}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color={web3Colors.accent} />
            <Text style={styles.statsText}>{(item.likes?.length || 0) + (likedPosts[item.id] ? 1 : 0)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={16} color={web3Colors.primary} />
            <Text style={styles.statsText}>{item.comments?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="card-giftcard" size={16} color={web3Colors.bonk} />
            <Text style={styles.statsText}>
              {item.gifts?.reduce((total, gift) => total + (gift.amount || 0), 0).toLocaleString()} BONK
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="share-variant" size={16} color={web3Colors.secondary} />
            <Text style={styles.statsText}>Share</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, likedPosts[item.id] && styles.actionButtonActive]}
            onPress={() => handleLike(item.id)}
            disabled={likedPosts[item.id]}
          >
            {likedPosts[item.id] ? (
              <Animated.View
                style={{
                  transform: [
                    { scale: animatedScales[item.id] || new Animated.Value(1) },
                  ],
                }}
              >
                <Ionicons name="heart" size={20} color={web3Colors.accent} />
              </Animated.View>
            ) : (
              <Ionicons name="heart-outline" size={20} color={web3Colors.textSecondary} />
            )}
            <Text style={[
              styles.actionText,
              likedPosts[item.id] && { color: web3Colors.accent }
            ]}>
              {likedPosts[item.id] ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedPostId(item?.id);
              setCommentModalVisible(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={web3Colors.textSecondary} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item.id)}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color={web3Colors.textSecondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.giftButton,
              isOwnPost && styles.giftButtonOwnPost,
              !hasWallet && !isOwnPost && styles.giftButtonInvalidWallet,
              canReceiveGifts && walletReady && styles.giftButtonEnabled,
              !walletReady && styles.giftButtonDisconnected
            ]}
            onPress={() => {
              if (isOwnPost) {
                Alert.alert(
                  'Your Own Post', 
                  'This is your post! You cannot send gifts to yourself.',
                  [{ text: 'Got it', style: 'default' }]
                );
              } else if (!hasWallet) {
                Alert.alert(
                  'Invalid Wallet', 
                  'This user does not have a valid Solana wallet address.',
                  [{ text: 'Understood', style: 'default' }]
                );
              } else if (!walletReady) {
                Alert.alert(
                  'Wallet Not Ready', 
                  'Your wallet is not properly connected. Please refresh.',
                  [{ text: 'Refresh', onPress: refreshConnection }]
                );
              } else {
                openGiftModal(item);
              }
            }}
            disabled={!canReceiveGifts || !walletReady}
          >
            <MaterialIcons 
              name="card-giftcard" 
              size={20} 
              color={
                isOwnPost 
                  ? web3Colors.success 
                  : !hasWallet 
                  ? web3Colors.warning 
                  : !walletReady
                  ? web3Colors.textSecondary
                  : web3Colors.bonk
              } 
            />
            <Text style={[
              styles.actionText, 
              { 
                color: isOwnPost 
                  ? web3Colors.success 
                  : !hasWallet 
                  ? web3Colors.warning 
                  : !walletReady
                  ? web3Colors.textSecondary
                  : web3Colors.bonk 
              }
            ]}>
              {isOwnPost ? 'MY POST' : !hasWallet ? 'NO WALLET' : !walletReady ? 'NOT READY' : 'BONK'}
            </Text>
          </TouchableOpacity>
        </View>

        {item.gifts && item.gifts.length > 0 && (
          <View style={styles.giftsPreview}>
            <Text style={styles.giftsPreviewTitle}>
              Recent BONK Gifts ({item.gifts.length} total):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.gifts.slice(-5).map((gift, index) => (
                <View key={index} style={styles.giftItem}>
                  <MaterialCommunityIcons name="dog" size={12} color={web3Colors.bonk} />
                  <Text style={styles.giftAmount}>{gift.amount?.toLocaleString()}</Text>
                  <Text style={styles.giftSender}>
                    {gift.senderName || 'Anonymous'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[web3Colors.background, '#1A1B3A', web3Colors.background]}
      style={styles.container}
    >
      {/* Streamlined Wallet Status Bar */}
      <StreamlinedWalletStatus />

      {loading ? (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[web3Colors.gradient1, web3Colors.gradient2]}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="white" />
          </LinearGradient>
          <Text style={styles.loadingText}>Loading BONK-powered posts...</Text>
        </View>
      ) : newsFeed.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={[web3Colors.cardBg, 'rgba(148, 69, 255, 0.1)']}
            style={styles.emptyCard}
          >
            <Ionicons name="newspaper" size={60} color={web3Colors.primary} />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share amazing Web3 content!</Text>
          </LinearGradient>
        </View>
      ) : (
        <FlatList
          data={newsFeed}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <LinearGradient
          colors={[web3Colors.gradient1, web3Colors.gradient2, web3Colors.gradient3]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      <CommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId}
        userId={getValidUserId(user, walletInfo)}
        endpoint={enndpoint.main}
      />

      {/* Streamlined BONK Gift Modal */}
      <Modal visible={giftModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.giftModalContent}>
            <LinearGradient
              colors={[web3Colors.gradient1, web3Colors.gradient2]}
              style={styles.giftModalHeader}
            >
              <MaterialIcons name="card-giftcard" size={32} color="white" />
              <Text style={styles.giftModalTitle}>Send BONK Gift 🎁</Text>
            </LinearGradient>

            <ScrollView 
              style={styles.giftModalBodyFixed}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Streamlined Balance Display */}
              <View style={styles.giftBalanceCard}>
                <View style={styles.giftBalanceHeader}>
                  <Text style={styles.giftBalanceLabel}>Your BONK Balance</Text>
                  <View style={styles.giftBalanceActions}>
                    <View style={[
                      styles.connectionStatus,
                      walletReady ? styles.connectionStatusConnected : styles.connectionStatusDisconnected
                    ]}>
                      <MaterialCommunityIcons 
                        name={walletReady ? "check-circle" : "alert-circle"} 
                        size={12} 
                        color={walletReady ? web3Colors.success : web3Colors.warning} 
                      />
                      <Text style={[
                        styles.connectionStatusText,
                        { color: walletReady ? web3Colors.success : web3Colors.warning }
                      ]}>
                        {walletReady ? 'Wallet Ready' : 'Wallet Not Ready'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {renderBalanceWithRefresh()}

                {userPublicKey && (
                  <View style={styles.walletInfoRow}>
                    <Text style={styles.walletInfoLabel}>Wallet:</Text>
                    <Text style={styles.walletInfoAddress}>
                      {userPublicKey.toBase58().slice(0, 8)}...{userPublicKey.toBase58().slice(-8)}
                    </Text>
                  </View>
                )}

                <View style={styles.blockchainStatusRow}>
                  <MaterialCommunityIcons 
                    name="lightning-bolt" 
                    size={12} 
                    color={web3Colors.secondary} 
                  />
                  <Text style={styles.blockchainStatusText}>
                    Solana Mainnet • No wallet reconnection needed
                  </Text>
                </View>
              </View>

              {/* Recipient Info */}
              <View style={styles.giftRecipientCard}>
                <Text style={styles.giftRecipientLabel}>Sending BONK to:</Text>
                <Text style={styles.giftRecipientName}>
                  @{selectedPost?.owner?.username || selectedPost?.userDisplayName || selectedPost?.userName || 'Anonymous'}
                </Text>
                
                <View style={styles.recipientWalletInfo}>
                  <View style={styles.recipientWalletRow}>
                    <MaterialCommunityIcons 
                      name="wallet" 
                      size={14} 
                      color={hasValidWallet(selectedPost || {}) ? web3Colors.success : web3Colors.warning} 
                    />
                    <Text style={[
                      styles.recipientWalletText,
                      { color: hasValidWallet(selectedPost || {}) ? web3Colors.success : web3Colors.warning }
                    ]}>
                      {hasValidWallet(selectedPost || {}) ? 'Verified Solana wallet' : 'Invalid wallet address'}
                    </Text>
                  </View>
                  {hasValidWallet(selectedPost || {}) && (
                    <Text style={styles.recipientWalletAddress}>
                      {(() => {
                        const addr = selectedPost?.owner?.walletAddress || selectedPost?.userWallet;
                        return addr ? `${addr.slice(0, 8)}...${addr.slice(-8)}` : '';
                      })()}
                    </Text>
                  )}
                </View>
                
                <Text style={styles.giftRecipientSubtext}>
                  ⚡ Using your existing wallet session - no reconnection needed! 🔥
                </Text>
              </View>

              {/* Amount Input Section */}
              <View style={styles.giftInputContainer}>
                <Text style={styles.giftInputLabel}>BONK Amount</Text>
                <View style={styles.giftAmountInputRow}>
                  <TextInput
                    style={[
                      styles.giftAmountInput,
                      (!userPublicKey || balanceLoading || !walletReady) && styles.giftAmountInputDisabled
                    ]}
                    value={giftAmount}
                    onChangeText={handleGiftAmountChange}
                    placeholder="0.00"
                    placeholderTextColor={web3Colors.textSecondary}
                    keyboardType="numeric"
                    editable={!!userPublicKey && !balanceLoading && walletReady}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.giftMaxButton,
                      (!userBonkBalance || userBonkBalance <= 0 || balanceLoading || !userPublicKey || !walletReady) && { opacity: 0.5 }
                    ]}
                    onPress={setMaxGiftAmount}
                    disabled={!userBonkBalance || userBonkBalance <= 0 || balanceLoading || !userPublicKey || !walletReady}
                  >
                    <Text style={styles.giftMaxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.giftQuickAmountContainer}>
                  {[100, 500, 1000, 5000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.giftQuickAmountButton,
                        (!userBonkBalance || userBonkBalance < amount || balanceLoading || !userPublicKey || !walletReady) && { opacity: 0.5 }
                      ]}
                      onPress={() => setGiftAmount(amount.toString())}
                      disabled={!userBonkBalance || userBonkBalance < amount || balanceLoading || !userPublicKey || !walletReady}
                    >
                      <Text style={[
                        styles.giftQuickAmountText,
                        (!userBonkBalance || userBonkBalance < amount || balanceLoading || !userPublicKey || !walletReady) && { color: web3Colors.textSecondary }
                      ]}>
                        {amount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Streamlined Validation Messages */}
                {!walletReady && (
                  <Text style={styles.giftValidationErrorText}>
                    Wallet not ready. Please refresh the app.
                  </Text>
                )}
                {walletReady && giftAmount && userBonkBalance !== null && parseFloat(giftAmount) > userBonkBalance && (
                  <Text style={styles.giftValidationErrorText}>
                    Insufficient balance. You have {userBonkBalance.toLocaleString()} BONK available.
                  </Text>
                )}
                {walletReady && userBonkBalance === 0 && (
                  <Text style={styles.giftValidationErrorText}>
                    You need BONK tokens to send gifts. Please add BONK to your wallet.
                  </Text>
                )}
              </View>

              {/* Post Preview */}
              <View style={styles.giftPostPreviewCard}>
                <Text style={styles.giftPreviewLabel}>Gifting for this post:</Text>
                <View style={styles.giftMiniPostPreview}>
                  <Text style={styles.giftMiniPostCaption}>
                    {selectedPost?.caption?.length > 100 
                      ? selectedPost.caption.slice(0, 100) + '...' 
                      : selectedPost?.caption}
                  </Text>
                  <Text style={styles.giftMiniPostMeta}>
                    by @{selectedPost?.owner?.username || selectedPost?.userDisplayName || selectedPost?.userName || 'Anonymous'}
                  </Text>
                </View>
              </View>

              {/* Streamlined Transaction Info */}
              {walletReady && giftAmount && parseFloat(giftAmount) > 0 && (
                <View style={styles.giftTransactionInfo}>
                  <Text style={styles.giftTransactionTitle}>🔥 Streamlined Transaction:</Text>
                  <View style={styles.giftTransactionRow}>
                    <Text style={styles.giftTransactionLabel}>Amount:</Text>
                    <Text style={styles.giftTransactionValue}>{parseFloat(giftAmount).toLocaleString()} BONK</Text>
                  </View>
                  <View style={styles.giftTransactionRow}>
                    <Text style={styles.giftTransactionLabel}>Network:</Text>
                    <Text style={styles.giftTransactionValue}>Solana Mainnet-Beta</Text>
                  </View>
                  <View style={styles.giftTransactionRow}>
                    <Text style={styles.giftTransactionLabel}>Session:</Text>
                    <Text style={styles.giftTransactionValue}>Already Authenticated</Text>
                  </View>
                  <View style={styles.giftTransactionRow}>
                    <Text style={styles.giftTransactionLabel}>Gas:</Text>
                    <Text style={styles.giftTransactionValue}>~0.000005 SOL</Text>
                  </View>
                  <Text style={styles.giftTransactionNote}>
                    ✨ No wallet reconnection needed - using your existing session!
                  </Text>
                  <Text style={styles.giftTransactionWarning}>
                    🚨 Real BONK tokens will be transferred!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Streamlined Action Buttons */}
            <View style={styles.giftModalActions}>
              <TouchableOpacity
                style={styles.giftCancelButton}
                onPress={() => {
                  setGiftModalVisible(false);
                  setGiftAmount('');
                  setSelectedPost(null);
                }}
                disabled={giftLoading}
              >
                <Text style={styles.giftCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.giftSendButton, 
                  (giftLoading || 
                   !giftAmount || 
                   parseFloat(giftAmount) <= 0 || 
                   !userBonkBalance || 
                   parseFloat(giftAmount) > userBonkBalance ||
                   balanceLoading ||
                   !userPublicKey ||
                   !walletReady ||
                   !hasValidWallet(selectedPost || {})) && styles.giftSendButtonDisabled
                ]}
                onPress={handleStreamlinedSendGift}
                disabled={
                  giftLoading || 
                  !giftAmount || 
                  parseFloat(giftAmount) <= 0 || 
                  !userBonkBalance || 
                  parseFloat(giftAmount) > userBonkBalance ||
                  balanceLoading ||
                  !userPublicKey ||
                  !walletReady ||
                  !hasValidWallet(selectedPost || {})
                }
              >
                {giftLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.giftSendButtonText}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="send" size={18} color="white" />
                    <Text style={styles.giftSendButtonText}>
                      {!walletReady 
                        ? 'Wallet Not Ready' 
                        : `Send ${giftAmount ? parseFloat(giftAmount).toLocaleString() : ''} BONK`
                      }
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Post Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[web3Colors.background, '#1A1B3A']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Web3 Post</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={web3Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.createModalBody}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>What's happening in Web3?</Text>
                <TextInput
                  placeholder="Share your thoughts about BONK, DeFi, NFTs..."
                  placeholderTextColor={web3Colors.textSecondary}
                  style={styles.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.pickButton}
                onPress={pickMedia}
              >
                <LinearGradient
                  colors={[web3Colors.gradient1, web3Colors.gradient2]}
                  style={styles.pickButtonGradient}
                >
                  <Ionicons 
                    name={selectedMedia.length > 0 ? "images" : "add-circle"} 
                    size={20} 
                    color="white" 
                  />
                  <Text style={styles.pickButtonText}>
                    {selectedMedia.length > 0 ? `${selectedMedia.length} Media Selected` : 'Add Media'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {selectedMedia.length > 0 && (
                <View style={styles.mediaPreviewSection}>
                  <Text style={styles.previewLabel}>Media Preview:</Text>
                  <ScrollView horizontal style={styles.mediaPreview}>
                    {selectedMedia.map((media, index) => (
                      <View key={index} style={styles.mediaPreviewItem}>
                        <Image
                          source={{ uri: media.uri }}
                          style={styles.mediaPreviewImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeMediaButton}
                          onPress={() => {
                            const newMedia = selectedMedia.filter((_, i) => i !== index);
                            setSelectedMedia(newMedia);
                          }}
                        >
                          <Ionicons name="close-circle" size={20} color={web3Colors.accent} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>🚀 Streamlined Web3 Features</Text>
                <Text style={styles.featuresText}>
                  • Earn real BONK tokens from your followers{'\n'}
                  • No wallet reconnection needed for gifts{'\n'}
                  • Fast transaction signing with existing session{'\n'}
                  • Real blockchain transactions{'\n'}
                  • Seamless Web3 creator experience
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleCreatePost}
                disabled={submitting}
              >
                <LinearGradient
                  colors={submitting 
                    ? [web3Colors.textSecondary, web3Colors.textSecondary] 
                    : [web3Colors.success, web3Colors.secondary]
                  }
                  style={styles.actionBtnGradient}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="rocket" size={20} color="white" />
                  )}
                  <Text style={styles.actionBtnText}>
                    {submitting ? 'Publishing...' : 'Publish Post'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setShowModal(false)}
              >
                <LinearGradient
                  colors={[web3Colors.cardBg, web3Colors.border]}
                  style={styles.actionBtnGradient}
                >
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={styles.actionBtnText}>Cancel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default BonkFeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Wallet Status Styles
  walletStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: web3Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: web3Colors.border,
  },
  walletStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 140,
    justifyContent: 'center',
  },
  walletStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  connectedInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  bonkBalanceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB80020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  bonkBalanceText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB800',
  },
  walletSessionText: {
    fontSize: 10,
    color: web3Colors.success,
    marginTop: 4,
  },
  errorContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: web3Colors.accent,
  },
  walletErrorText: {
    fontSize: 12,
    color: web3Colors.accent,
    textAlign: 'center',
    marginBottom: 6,
  },
  retryButton: {
    backgroundColor: web3Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    fontWeight: '500',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Feed Container
  feedContainer: {
    paddingVertical: 10,
    paddingBottom:120
  },
  
  // Post Card Styles
  postCard: {
    backgroundColor: web3Colors.cardBg,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
    shadowColor: web3Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Post Header
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: web3Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginRight: 8,
  },
  ownPostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: web3Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  ownPostBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 2,
  },
  invalidWalletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: web3Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  invalidWalletBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 2,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  walletText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  postTimeText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: web3Colors.accent,
    marginLeft: 4,
  },
  
  // Caption
  captionText: {
    fontSize: 16,
    color: web3Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  
  // Media Styles
  singleMedia: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: web3Colors.darkOverlay,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 4,
  },
  gridItem: {
    width: (width - 70) / 2,
    height: 120,
  },
  gridMedia: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: web3Colors.darkOverlay,
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: web3Colors.glassOverlay,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statsText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  actionText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  giftButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  giftButtonOwnPost: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  giftButtonInvalidWallet: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  giftButtonEnabled: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  giftButtonDisconnected: {
    backgroundColor: 'rgba(139, 140, 167, 0.1)',
  },
  
  // Gifts Preview
  giftsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: web3Colors.border,
  },
  giftsPreviewTitle: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  giftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  giftAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: web3Colors.bonk,
    marginLeft: 4,
  },
  giftSender: {
    fontSize: 9,
    color: web3Colors.textSecondary,
    marginLeft: 4,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: web3Colors.darkOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.95,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 0,
    margin: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: web3Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  
  // Create Modal Body
  createModalBody: {
    maxHeight: 400,
  },
  scrollViewContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: web3Colors.text,
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: web3Colors.glassOverlay,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: web3Colors.text,
    borderWidth: 1,
    borderColor: web3Colors.border,
    minHeight: 100,
  },
  
  // Pick Button
  pickButton: {
    marginBottom: 20,
  },
  pickButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Media Preview
  mediaPreviewSection: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: web3Colors.text,
    marginBottom: 8,
  },
  mediaPreview: {
    paddingVertical: 4,
  },
  mediaPreviewItem: {
    marginRight: 12,
    position: 'relative',
  },
  mediaPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: web3Colors.cardBg,
    borderRadius: 10,
  },
  
  // Features Card
  featuresCard: {
    backgroundColor: web3Colors.glassOverlay,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Gift Modal Styles
  giftModalContent: {
    width: width * 0.95,
    maxHeight: '85%',
    backgroundColor: web3Colors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  giftModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  giftModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  giftModalBodyFixed: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  
  // Gift Balance Card
  giftBalanceCard: {
    backgroundColor: web3Colors.glassOverlay,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  giftBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  giftBalanceLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    fontWeight: '500',
  },
  giftBalanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  connectionStatusConnected: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  connectionStatusDisconnected: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
  },
  connectionStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  giftBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  giftBalanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginLeft: 8,
  },
  balanceRefreshButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: 'rgba(148, 69, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 69, 255, 0.3)',
  },
  walletInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  walletInfoLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
  },
  walletInfoAddress: {
    fontSize: 12,
    color: web3Colors.primary,
    fontFamily: 'monospace',
  },
  blockchainStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockchainStatusText: {
    fontSize: 11,
    color: web3Colors.secondary,
    fontWeight: '500',
  },
  
  // Gift Recipient Card
  giftRecipientCard: {
    backgroundColor: web3Colors.glassOverlay,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  giftRecipientLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 4,
  },
  giftRecipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 8,
  },
  recipientWalletInfo: {
    marginBottom: 8,
  },
  recipientWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientWalletText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  recipientWalletAddress: {
    fontSize: 11,
    color: web3Colors.textSecondary,
    fontFamily: 'monospace',
    marginLeft: 20,
  },
  giftRecipientSubtext: {
    fontSize: 14,
    color: web3Colors.bonk,
    fontWeight: '600',
  },
  
  // Gift Input Container
  giftInputContainer: {
    marginBottom: 16,
  },
  giftInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: web3Colors.text,
    marginBottom: 8,
  },
  giftAmountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  giftAmountInput: {
    flex: 1,
    backgroundColor: web3Colors.glassOverlay,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: web3Colors.text,
    borderWidth: 1,
    borderColor: web3Colors.border,
    marginRight: 12,
  },
  giftAmountInputDisabled: {
    opacity: 0.5,
  },
  giftMaxButton: {
    backgroundColor: web3Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  giftMaxButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Quick Amount Buttons
  giftQuickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  giftQuickAmountButton: {
    backgroundColor: web3Colors.glassOverlay,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: web3Colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  giftQuickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: web3Colors.text,
  },
  
  // Validation Error
  giftValidationErrorText: {
    fontSize: 12,
    color: web3Colors.accent,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Gift Post Preview Card
  giftPostPreviewCard: {
    backgroundColor: web3Colors.glassOverlay,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  giftPreviewLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  giftMiniPostPreview: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  giftMiniPostCaption: {
    fontSize: 14,
    color: web3Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  giftMiniPostMeta: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Gift Transaction Info
  giftTransactionInfo: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  giftTransactionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: web3Colors.bonk,
    marginBottom: 8,
  },
  giftTransactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  giftTransactionLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
  },
  giftTransactionValue: {
    fontSize: 12,
    color: web3Colors.text,
    fontWeight: '500',
  },
  giftTransactionNote: {
    fontSize: 11,
    color: web3Colors.success,
    marginTop: 8,
    fontStyle: 'italic',
  },
  giftTransactionWarning: {
    fontSize: 12,
    color: web3Colors.bonk,
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Gift Modal Actions
  giftModalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: web3Colors.border,
  },
  giftCancelButton: {
    flex: 1,
    backgroundColor: web3Colors.glassOverlay,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  giftCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: web3Colors.textSecondary,
  },
  giftSendButton: {
    flex: 2,
    backgroundColor: web3Colors.bonk,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  giftSendButtonDisabled: {
    backgroundColor: web3Colors.textSecondary,
    opacity: 0.5,
  },
  giftSendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});