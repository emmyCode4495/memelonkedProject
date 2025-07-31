// constants/index.js
import { clusterApiUrl } from '@solana/web3.js';
// hooks/useBonkBalance.js
import { useState, useCallback, useEffect, useContext } from 'react';

import { 
  getAssociatedTokenAddress, 
  getAccount, 
  TokenAccountNotFoundError 
} from '@solana/spl-token';

// utils/index.js
import { PublicKey, Connection } from '@solana/web3.js';

import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';




import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';
import { AuthContext } from '../src/persistence/AuthContext';
import { APP_IDENTITY } from '../src/Auth/providers/AuthorizationProvider';





// Web3 Color Palette with Meme Theme
export const web3Colors = {
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
  meme: '#FFD700',
  viral: '#FF1493',
};

// BONK Token Configuration
export const BONK_CONFIG = {
  MINT_ADDRESS: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  DECIMALS: 5,
  SYMBOL: 'BONK'
};

// Solana Network Configuration
export const SOLANA_CONFIG = {
  NETWORK: 'mainnet-beta',
  COMMITMENT: 'confirmed'
};

// Enhanced RPC Configuration for better reliability
export const RPC_ENDPOINTS = [
  process.env.REACT_APP_RPC_URL,
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
  'https://mainnet.helius-rpc.com/?api-key=your-helius-key',
  clusterApiUrl(SOLANA_CONFIG.NETWORK)
].filter(Boolean);


/**
 * Wallet validation utility
 */
export const validateWalletAddress = (address) => {
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
export const convertToPublicKey = (walletAddress) => {
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
    console.error('Error converting wallet address:', error);
    return null;
  }
};

/**
 * Enhanced Connection Manager for better RPC reliability
 */
export const createReliableConnection = async () => {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      console.log(`Testing RPC endpoint: ${endpoint}`);
      const connection = new Connection(endpoint, {
        commitment: SOLANA_CONFIG.COMMITMENT,
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
 * Get valid user ID from various possible sources
 */
export const getValidUserId = (user, walletInfo) => {
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

/**
 * Format BONK amount for display
 */
export const formatBonkAmount = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return Number(amount).toLocaleString();
};

/**
 * Validate BONK amount input
 */
export const validateBonkAmount = (amount, balance) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount greater than 0' };
  }
  if (balance !== null && numAmount > balance) {
    return { isValid: false, error: `Insufficient balance. You have ${formatBonkAmount(balance)} BONK available.` };
  }
  return { isValid: true, error: null };
};


/**
 * Enhanced BONK Balance Hook with proper wallet tracking
 */
export const useBonkBalance = (publicKey, walletAddress) => {
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
      const bonkMint = new PublicKey(BONK_CONFIG.MINT_ADDRESS);
      const associatedTokenAddress = await getAssociatedTokenAddress(bonkMint, publicKey);
      
      try {
        const account = await getAccount(connection, associatedTokenAddress);
        const tokenBalance = Number(account.amount) / Math.pow(10, BONK_CONFIG.DECIMALS);
        
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
      console.error("Error fetching balance:", err);
      
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
  }, [publicKey, walletAddress, fetchBalance]);

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
 * Streamlined Wallet Provider - Uses existing authentication
 */
export const useStreamlinedWallet = () => {
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
          console.error('❌ Invalid wallet address format');
        }
      } else {
        setSessionError('No valid wallet address found in authentication');
        console.error('❌ No wallet address found in user auth');
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
              cluster: SOLANA_CONFIG.NETWORK,
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
      console.error('Failed to refresh wallet connection:', error);
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



/**
 * STREAMLINED BONK Transfer Function - Uses existing wallet session
 */
export const executeStreamlinedBonkTransfer = async (
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
    
    const bonkMint = new PublicKey(BONK_CONFIG.MINT_ADDRESS);
    
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
      const senderBalance = Number(senderAccount.amount) / Math.pow(10, BONK_CONFIG.DECIMALS);
      
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
    const tokenAmount = Math.floor(amount * Math.pow(10, BONK_CONFIG.DECIMALS));
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
    
    // Handle wallet session and auth token renewal
    let signedTx;
    try {
      signedTx = await transact(async (wallet) => {
        console.log('📱 Requesting fresh authorization and signature...');
        
        // Request fresh authorization for signing
        const authResult = await wallet.authorize({
          cluster: SOLANA_CONFIG.NETWORK,
          identity: APP_IDENTITY,
        });
        
        console.log('✅ Fresh authorization obtained:', authResult.auth_token ? 'Token valid' : 'No token');
        
        // Sign the transaction with the fresh session
        const signResult = await wallet.signTransactions({
          transactions: [transaction],
        });
        
        console.log('✅ Transaction signed successfully');
        return signResult.signedTransactions[0];
      });
      
      console.log('✅ Transaction signed with renewed session');
    } catch (signError) {
      console.error('❌ Transaction signing failed:', signError);
      
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
      console.error('❌ Failed to send transaction:', sendError);
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
      console.error('❌ Transaction confirmation failed:', confirmError);
      
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
    console.error('💥 BONK transfer failed:', error);
    throw error;
  }
};