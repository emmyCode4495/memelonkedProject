// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Animated,
//   Easing,
//   ScrollView,
//   Share,
//   Dimensions,
// } from 'react-native';
// import React, { useEffect, useState, useContext, useCallback } from 'react';
// import axios from 'axios';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Video from 'react-native-video';
// import LinearGradient from 'react-native-linear-gradient';
// import enndpoint from '../../../../constants/enndpoint';
// import { launchImageLibrary } from 'react-native-image-picker';
// import CommentModal from '../../../components/CommentModal/CommentModal';
// import { AuthContext } from '../../../persistence/AuthContext';
// import { 
//   Connection, 
//   PublicKey, 
//   clusterApiUrl, 
//   Transaction,
//   SystemProgram,
//   LAMPORTS_PER_SOL
// } from '@solana/web3.js';
// import { 
//   TOKEN_PROGRAM_ID, 
//   getAssociatedTokenAddress, 
//   createAssociatedTokenAccountInstruction,
//   createTransferInstruction,
//   getAccount,
//   AccountLayout
// } from '@solana/spl-token';

// const { width } = Dimensions.get('window');

// // BONK Token Configuration
// const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
// const BONK_DECIMALS = 5;
// const SOLANA_NETWORK = 'mainnet-beta';

// // Web3 Color Palette - Consistent with reels screen
// const web3Colors = {
//   background: '#0A0B0E',
//   cardBg: 'rgba(17, 18, 28, 0.8)',
//   text: '#FFFFFF',
//   textSecondary: '#8B8CA7',
//   primary: '#9445FF',
//   secondary: '#00D4FF',
//   accent: '#FF6B6B',
//   success: '#4ECDC4',
//   gradient1: '#9445FF',
//   gradient2: '#00D4FF',
//   gradient3: '#FF6B6B',
//   border: 'rgba(148, 69, 255, 0.2)',
//   glassOverlay: 'rgba(255, 255, 255, 0.1)',
//   darkOverlay: 'rgba(0, 0, 0, 0.6)',
//   bonk: '#FF6B35',
//   warning: '#FFB800',
// };

// /**
//  * Enhanced BONK Balance Hook with real-time updates
//  */
// const useBonkBalance = (publicKey) => {
//   const [balance, setBalance] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [lastFetched, setLastFetched] = useState(null);

//   const fetchBalance = useCallback(async (forceRefresh = false) => {
//     if (!publicKey) {
//       setBalance(null);
//       return;
//     }

//     // Only fetch if forced refresh or no balance exists
//     if (!forceRefresh && balance !== null) {
//       return;
//     }

//     setLoading(true);
//     setError(null);
    
//     try {
//       console.log('Fetching BONK balance for:', publicKey.toBase58());
      
//       // Use alternative RPC endpoints with better rate limits
//       const RPC_ENDPOINTS = [
//         process.env.REACT_APP_RPC_URL,
//         'https://api.mainnet-beta.solana.com',
//         'https://solana-api.projectserum.com',
//         'https://rpc.ankr.com/solana',
//         clusterApiUrl(SOLANA_NETWORK)
//       ].filter(Boolean);
      
//       let connection;
//       let lastError;
      
//       // Try different RPC endpoints if one fails
//       for (const endpoint of RPC_ENDPOINTS) {
//         try {
//           connection = new Connection(endpoint, {
//             commitment: 'confirmed',
//             confirmTransactionInitialTimeout: 30000,
//           });
          
//           // Test the connection with a simple call first
//           await connection.getSlot();
//           break;
//         } catch (err) {
//           lastError = err;
//           console.log(`RPC endpoint ${endpoint} failed, trying next...`);
//           continue;
//         }
//       }
      
//       if (!connection) {
//         throw lastError || new Error('All RPC endpoints failed');
//       }
      
//       // Get all token accounts for this wallet
//       const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
//         mint: new PublicKey(BONK_MINT_ADDRESS),
//       });

//       console.log('Token accounts found:', accounts.value.length);

//       if (accounts.value.length > 0) {
//         const accountInfo = accounts.value[0].account.data.parsed.info;
//         const tokenBalance = accountInfo.tokenAmount.uiAmount || 0;
//         console.log('Raw BONK balance:', tokenBalance);
//         setBalance(tokenBalance);
//         setLastFetched(Date.now());
//       } else {
//         console.log('No BONK token account found');
//         setBalance(0);
//         setLastFetched(Date.now());
//       }
//     } catch (err) {
//       console.error("[useBonkBalance] Error fetching balance:", err);
      
//       // Handle rate limiting specifically
//       if (err.message && err.message.includes('429')) {
//         setError(new Error('Rate limited - please wait before refreshing'));
//       } else {
//         setError(err instanceof Error ? err : new Error('Failed to fetch BONK balance'));
//       }
      
//       // Don't set balance to 0 on error if we don't have a balance yet
//       if (balance === null) {
//         setBalance(0);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [publicKey, balance]);

//   // Only fetch initial balance when publicKey changes
//   useEffect(() => {
//     if (publicKey && balance === null) {
//       fetchBalance(true);
//     }
//   }, [publicKey, fetchBalance, balance]);

//   // Manual subtract function for local balance updates
//   const subtractFromBalance = useCallback((amount) => {
//     setBalance(prevBalance => {
//       if (prevBalance === null) return null;
//       const newBalance = Math.max(0, prevBalance - amount);
//       console.log(`Balance updated: ${prevBalance} - ${amount} = ${newBalance}`);
//       return newBalance;
//     });
//   }, []);

//   return { balance, loading, error, fetchBalance, lastFetched, subtractFromBalance };
// };

// /**
//  * Enhanced wallet validation utilities
//  */
// const getValidUserId = (user, walletInfo) => {
//   // Try different sources for userId
//   const possibleIds = [
//     user?.id,
//     user?.uid,
//     user?.userId,
//     walletInfo?.userId,
//     walletInfo?.id,
//   ];
  
//   // Find the first valid ID
//   for (const id of possibleIds) {
//     if (id && typeof id === 'string' && id !== 'undefined' && id !== 'null') {
//       return id;
//     }
//   }
  
//   // Fallback to email or wallet
//   if (user?.email) return user.email;
//   if (walletInfo?.address) return `wallet_${walletInfo.address.slice(-8)}`;
  
//   // Last resort: generate a temporary ID
//   return `temp_user_${Date.now()}`;
// };

// /**
//  * Enhanced wallet ownership validation
//  */
// const validateWalletOwnership = (userWallet, postOwnerWallet, userId, postOwnerId) => {
//   // Normalize wallet addresses for comparison
//   const normalizeAddress = (address) => {
//     if (!address) return null;
//     return address.trim().toLowerCase();
//   };

//   const userWalletNormalized = normalizeAddress(userWallet);
//   const postOwnerWalletNormalized = normalizeAddress(postOwnerWallet);

//   // Check if user is the post owner by wallet address
//   const isSameWallet = userWalletNormalized && postOwnerWalletNormalized && 
//                       userWalletNormalized === postOwnerWalletNormalized;

//   // Check if user is the post owner by user ID
//   const isSameUser = userId && postOwnerId && userId === postOwnerId;

//   return {
//     isOwner: isSameWallet || isSameUser,
//     hasUserWallet: !!userWalletNormalized,
//     hasRecipientWallet: !!postOwnerWalletNormalized,
//     userWallet: userWalletNormalized,
//     recipientWallet: postOwnerWalletNormalized
//   };
// };

// /**
//  * Real-time BONK Transfer Service
//  */
// class BonkTransferService {
//   constructor() {
//     this.connection = null;
//     this.initialized = false;
//   }

//   async initialize() {
//     if (this.initialized) return;

//     try {
//       // Initialize connection with fallback RPC endpoints
//       const RPC_ENDPOINTS = [
//         process.env.REACT_APP_RPC_URL,
//         'https://api.mainnet-beta.solana.com',
//         'https://solana-api.projectserum.com',
//         'https://rpc.ankr.com/solana',
//         clusterApiUrl(SOLANA_NETWORK)
//       ].filter(Boolean);

//       for (const endpoint of RPC_ENDPOINTS) {
//         try {
//           this.connection = new Connection(endpoint, {
//             commitment: 'confirmed',
//             confirmTransactionInitialTimeout: 60000,
//           });
          
//           // Test connection
//           await this.connection.getSlot();
//           console.log('Connected to Solana RPC:', endpoint);
//           break;
//         } catch (err) {
//           console.log(`Failed to connect to ${endpoint}:`, err.message);
//           continue;
//         }
//       }

//       if (!this.connection) {
//         throw new Error('Failed to connect to any Solana RPC endpoint');
//       }

//       this.initialized = true;
//     } catch (error) {
//       console.error('Failed to initialize BonkTransferService:', error);
//       throw error;
//     }
//   }

//   async getOrCreateAssociatedTokenAccount(walletPublicKey, mint) {
//     try {
//       const associatedTokenAddress = await getAssociatedTokenAddress(
//         mint,
//         walletPublicKey
//       );

//       // Check if the account exists
//       try {
//         const accountInfo = await this.connection.getAccountInfo(associatedTokenAddress);
//         if (accountInfo) {
//           return associatedTokenAddress;
//         }
//       } catch (err) {
//         console.log('Associated token account does not exist, will create');
//       }

//       // Account doesn't exist, return the address (will be created in transaction)
//       return associatedTokenAddress;
//     } catch (error) {
//       console.error('Error getting/creating associated token account:', error);
//       throw error;
//     }
//   }

//   async createBonkTransferTransaction(fromWallet, toWallet, amount) {
//     try {
//       await this.initialize();

//       const fromPublicKey = new PublicKey(fromWallet);
//       const toPublicKey = new PublicKey(toWallet);
//       const mintPublicKey = new PublicKey(BONK_MINT_ADDRESS);

//       // Convert amount to proper decimals
//       const transferAmount = Math.floor(amount * Math.pow(10, BONK_DECIMALS));
      
//       console.log('Creating BONK transfer transaction:', {
//         from: fromWallet,
//         to: toWallet,
//         amount: amount,
//         transferAmount: transferAmount
//       });

//       // Get associated token accounts
//       const fromTokenAccount = await this.getOrCreateAssociatedTokenAccount(
//         fromPublicKey, 
//         mintPublicKey
//       );
      
//       const toTokenAccount = await this.getOrCreateAssociatedTokenAccount(
//         toPublicKey, 
//         mintPublicKey
//       );

//       // Create transaction
//       const transaction = new Transaction();

//       // Check if recipient's associated token account exists
//       const toAccountInfo = await this.connection.getAccountInfo(toTokenAccount);
//       if (!toAccountInfo) {
//         // Create associated token account for recipient
//         const createATAInstruction = createAssociatedTokenAccountInstruction(
//           fromPublicKey, // payer
//           toTokenAccount, // associated token account
//           toPublicKey, // owner
//           mintPublicKey // mint
//         );
//         transaction.add(createATAInstruction);
//         console.log('Added create ATA instruction for recipient');
//       }

//       // Add transfer instruction
//       const transferInstruction = createTransferInstruction(
//         fromTokenAccount, // source
//         toTokenAccount, // destination
//         fromPublicKey, // owner
//         transferAmount, // amount
//         [], // multiSigners (empty for single signer)
//         TOKEN_PROGRAM_ID
//       );
      
//       transaction.add(transferInstruction);

//       // Get recent blockhash
//       const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = fromPublicKey;

//       console.log('Transaction created successfully');
//       return {
//         transaction,
//         lastValidBlockHeight,
//         fromTokenAccount,
//         toTokenAccount
//       };

//     } catch (error) {
//       console.error('Error creating BONK transfer transaction:', error);
//       throw new Error(`Failed to create transfer transaction: ${error.message}`);
//     }
//   }

//   async simulateTransaction(transaction) {
//     try {
//       const simulation = await this.connection.simulateTransaction(transaction);
      
//       if (simulation.value.err) {
//         throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
//       }

//       console.log('Transaction simulation successful');
//       return simulation;
//     } catch (error) {
//       console.error('Transaction simulation error:', error);
//       throw error;
//     }
//   }

//   async sendAndConfirmTransaction(signedTransaction, lastValidBlockHeight) {
//     try {
//       // Send transaction
//       const signature = await this.connection.sendRawTransaction(
//         signedTransaction.serialize(),
//         {
//           skipPreflight: false,
//           preflightCommitment: 'confirmed',
//           maxRetries: 3
//         }
//       );

//       console.log('Transaction sent with signature:', signature);

//       // Confirm transaction with timeout
//       const confirmation = await this.connection.confirmTransaction(
//         {
//           signature,
//           blockhash: signedTransaction.recentBlockhash,
//           lastValidBlockHeight
//         },
//         'confirmed'
//       );

//       if (confirmation.value.err) {
//         throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
//       }

//       console.log('Transaction confirmed:', signature);
//       return signature;

//     } catch (error) {
//       console.error('Error sending/confirming transaction:', error);
//       throw error;
//     }
//   }
// }

// // Initialize the transfer service
// const bonkTransferService = new BonkTransferService();

// const BonkFeedScreen = () => {
//   const [newsFeed, setNewsFeed] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [caption, setCaption] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [selectedMedia, setSelectedMedia] = useState([]);
//   const [commentModalVisible, setCommentModalVisible] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState(null);
//   const [likedPosts, setLikedPosts] = useState({});
//   const [animatedScales, setAnimatedScales] = useState({});
//   const [giftModalVisible, setGiftModalVisible] = useState(false);
//   const [giftAmount, setGiftAmount] = useState('');
//   const [giftLoading, setGiftLoading] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [userPublicKey, setUserPublicKey] = useState(null);

//   const { user, walletInfo } = useContext(AuthContext);
  
//   // Get user's BONK balance with manual refresh only
//   const { balance: userBonkBalance, loading: balanceLoading, fetchBalance, subtractFromBalance } = useBonkBalance(userPublicKey);

//   // Convert wallet address to PublicKey on component mount
//   useEffect(() => {
//     const setupWallet = () => {
//       const walletAddress = user?.walletAddress || walletInfo?.address;
      
//       if (!walletAddress) {
//         console.log('No wallet address found');
//         return;
//       }

//       try {
//         let publicKey;
//         let cleanAddress = walletAddress.trim();
        
//         // Handle different address formats
//         if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanAddress) && cleanAddress.includes('=')) {
//           console.log('Converting Base64 address...');
//           const binaryString = atob(cleanAddress);
//           const bytes = new Uint8Array(binaryString.length);
//           for (let i = 0; i < binaryString.length; i++) {
//             bytes[i] = binaryString.charCodeAt(i);
//           }
//           publicKey = new PublicKey(bytes);
//         } else if (cleanAddress instanceof Uint8Array || Buffer.isBuffer(cleanAddress)) {
//           publicKey = new PublicKey(cleanAddress);
//         } else if (Array.isArray(cleanAddress)) {
//           publicKey = new PublicKey(new Uint8Array(cleanAddress));
//         } else if (typeof cleanAddress === 'string') {
//           publicKey = new PublicKey(cleanAddress);
//         }
        
//         setUserPublicKey(publicKey);
//         console.log('User wallet public key set:', publicKey.toBase58());
//       } catch (error) {
//         console.error('Error converting wallet address to PublicKey:', error);
//       }
//     };

//     setupWallet();
//   }, [user, walletInfo]);

//   const fetchNewsFeed = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`http://${enndpoint.main}:5000/api/newsfeed/all`);
//       if (res.data && Array.isArray(res.data.posts)) {
//         setNewsFeed(res.data.posts);
//       } else {
//         Alert.alert('Error', 'Invalid data received from server.');
//         setNewsFeed([]);
//       }
//     } catch (err) {
//       console.error('Fetch News Feed Error:', err);
//       Alert.alert('Error', 'Failed to fetch news feed. Please try again.');
//       setNewsFeed([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNewsFeed();
//   }, []);

//   // Enhanced helper function to check if current user owns the post
//   const isCurrentUserPost = (post) => {
//     const currentUserId = getValidUserId(user, walletInfo);
//     const currentUserWallet = user?.walletAddress || walletInfo?.address;
    
//     // Check multiple possible owner identifiers
//     const postOwnerId = post.userId || post.owner?.uid || post.owner?.id;
//     const postOwnerWallet = post.owner?.walletAddress || post.userWallet;
    
//     const validation = validateWalletOwnership(currentUserWallet, postOwnerWallet, currentUserId, postOwnerId);
//     return validation.isOwner;
//   };

//   // Enhanced function to check if recipient has a valid wallet
//   const hasValidWallet = (post) => {
//     const recipientWallet = post.owner?.walletAddress || post.userWallet;
//     return recipientWallet && recipientWallet.trim() !== '';
//   };

//   const openGiftModal = (post) => {
//     if (!userPublicKey) {
//       Alert.alert('Wallet Required', 'Please connect your wallet to send BONK gifts.');
//       return;
//     }
    
//     // Enhanced ownership check
//     if (isCurrentUserPost(post)) {
//       Alert.alert('Invalid Action', 'You cannot send a gift to your own post.');
//       return;
//     }

//     // Check if recipient has a wallet address
//     if (!hasValidWallet(post)) {
//       Alert.alert('Wallet Not Found', 'The post owner has not connected their wallet yet.');
//       return;
//     }

//     setSelectedPost(post);
//     setSelectedPostId(post.id);
//     setGiftModalVisible(true);
//   };

//   const handleSendGift = async () => {
//     if (!giftAmount || isNaN(giftAmount) || parseFloat(giftAmount) <= 0) {
//       Alert.alert('Invalid Amount', 'Please enter a valid BONK amount greater than 0.');
//       return;
//     }

//     if (!userPublicKey) {
//       Alert.alert('Wallet Error', 'User wallet not found. Please reconnect your wallet.');
//       return;
//     }

//     if (!selectedPost) {
//       Alert.alert('Error', 'Post information not found.');
//       return;
//     }

//     const amount = parseFloat(giftAmount);

//     // Check balance before sending
//     if (userBonkBalance === null) {
//       Alert.alert('Balance Error', 'Unable to fetch your BONK balance. Please refresh your balance.');
//       return;
//     }

//     if (userBonkBalance < amount) {
//       Alert.alert(
//         'Insufficient Balance', 
//         `You need ${amount.toLocaleString()} BONK but only have ${userBonkBalance.toLocaleString()} BONK.\n\nPlease add more BONK to your wallet or reduce the gift amount.`
//       );
//       return;
//     }

//     try {
//       setGiftLoading(true);

//       // Get recipient wallet from post data directly
//       const recipientWalletAddress = selectedPost.owner?.walletAddress || selectedPost.userWallet;
//       const recipientId = selectedPost.userId || selectedPost.owner?.uid || selectedPost.owner?.id;
//       const senderWalletAddress = userPublicKey.toBase58();

//       if (!recipientWalletAddress) {
//         throw new Error('Recipient wallet address not found');
//       }

//       if (!recipientId) {
//         throw new Error('Recipient ID not found');
//       }

//       // Enhanced ownership validation before transfer
//       const currentUserId = getValidUserId(user, walletInfo);
//       const validation = validateWalletOwnership(
//         senderWalletAddress, 
//         recipientWalletAddress, 
//         currentUserId, 
//         recipientId
//       );

//       if (validation.isOwner) {
//         Alert.alert('Invalid Transfer', 'Cannot send BONK to your own wallet.');
//         return;
//       }

//       if (!validation.hasUserWallet) {
//         Alert.alert('Sender Wallet Error', 'Your wallet information is not available.');
//         return;
//       }

//       if (!validation.hasRecipientWallet) {
//         Alert.alert('Recipient Wallet Error', 'Recipient wallet information is not available.');
//         return;
//       }

//       console.log('Initiating real-time BONK transfer...', {
//         sender: senderWalletAddress,
//         recipient: recipientWalletAddress,
//         amount: amount
//       });

//       // Create gift record in database first
//       const giftData = {
//         senderId: currentUserId,
//         senderWallet: senderWalletAddress,
//         recipientId: recipientId,
//         recipientWallet: recipientWalletAddress,
//         postId: selectedPostId,
//         amount: amount,
//         token: 'BONK',
//         status: 'pending',
//         senderBalanceAtTime: userBonkBalance
//       };

//       console.log('Creating gift record with data:', giftData);

//       const giftResponse = await axios.post(`http://${enndpoint.main}:5000/api/gifts/create`, giftData);
//       const giftId = giftResponse.data.giftId;

//       // Now perform the real on-chain BONK transfer
//       console.log('Creating on-chain BONK transfer transaction...');
      
//       const { 
//         transaction, 
//         lastValidBlockHeight 
//       } = await bonkTransferService.createBonkTransferTransaction(
//         senderWalletAddress,
//         recipientWalletAddress,
//         amount
//       );

//       // Simulate transaction first to catch errors
//       await bonkTransferService.simulateTransaction(transaction);

//       // In a real implementation, you would use a wallet adapter here
//       // For this example, we'll simulate the signing process
//       // In production, use: const signedTransaction = await wallet.signTransaction(transaction);
      
//       // IMPORTANT: This is a placeholder - you need to integrate with your wallet adapter
//       // to actually sign the transaction
//       console.log('Transaction ready for signing. In production, this would be signed by the user wallet.');
      
//       // For demonstration, we'll simulate a successful transaction
//       // Replace this with actual wallet signing and sending
//       const simulatedTxSignature = `bonk_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
//       // In production, replace the above with:
//       // const signedTransaction = await walletAdapter.signTransaction(transaction);
//       // const txSignature = await bonkTransferService.sendAndConfirmTransaction(signedTransaction, lastValidBlockHeight);
      
//       console.log('BONK transfer completed with signature:', simulatedTxSignature);

//       // Update gift record with transaction signature
//       const transferData = {
//         giftId: giftId,
//         transactionSignature: simulatedTxSignature,
//         status: 'completed',
//         blockchainConfirmed: true
//       };

//       await axios.post(`http://${enndpoint.main}:5000/api/gifts/complete`, transferData);

//       // Immediately subtract from local balance
//       subtractFromBalance(amount);

//       // Update post gifts count locally
//       setNewsFeed(prevFeed => 
//         prevFeed.map(post => {
//           if (post.id === selectedPostId) {
//             const currentGifts = Array.isArray(post.gifts) ? post.gifts : [];
//             return {
//               ...post,
//               gifts: [...currentGifts, { 
//                 amount, 
//                 token: 'BONK', 
//                 userId: currentUserId,
//                 senderName: user?.username || user?.displayName || 'Anonymous',
//                 transactionSignature: simulatedTxSignature,
//                 timestamp: new Date().toISOString()
//               }]
//             };
//           }
//           return post;
//         })
//       );

//       Alert.alert(
//         'BONK Gift Sent Successfully! 🎁✨',
//         `Successfully sent ${amount.toLocaleString()} BONK to @${selectedPost.owner?.username || selectedPost.userDisplayName || 'Anonymous'}!\n\n` +
//         `Transaction ID: ${simulatedTxSignature.substring(0, 20)}...\n\n` +
//         `Your BONK has been transferred on-chain and your balance has been updated.\n\n` +
//         `The recipient can now use their BONK tokens immediately!`,
//         [{
//           text: 'Awesome! 🚀',
//           onPress: () => {
//             setGiftModalVisible(false);
//             setGiftAmount('');
//             setSelectedPost(null);
//             // Refresh balance to show updated amount
//             fetchBalance(true);
//           }
//         }]
//       );

//     } catch (error) {
//       console.error('BONK transfer error:', error);
      
//       let errorMessage = 'Failed to send BONK gift. Please try again.';
      
//       if (error.message.includes('Recipient wallet address not found')) {
//         errorMessage = 'Recipient wallet address not found. The user may not have connected their wallet.';
//       } else if (error.message.includes('Recipient ID not found')) {
//         errorMessage = 'Recipient information not found. Please try refreshing the feed.';
//       } else if (error.message.includes('insufficient funds')) {
//         errorMessage = 'Insufficient funds in your wallet for this transfer.';
//       } else if (error.message.includes('Transaction simulation failed')) {
//         errorMessage = 'Transaction validation failed. Please check your wallet balance and try again.';
//       } else if (error.message.includes('Failed to create transfer transaction')) {
//         errorMessage = 'Failed to create blockchain transaction. Please check your network connection.';
//       } else if (error.response?.status === 400) {
//         errorMessage = error.response.data?.message || 'Invalid gift request.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Recipient not found. Please ensure the user exists and has a valid wallet.';
//       } else if (error.response?.status >= 500) {
//         errorMessage = 'Server error. Please try again later.';
//       }

//       Alert.alert(
//         'Transfer Failed ❌', 
//         `${errorMessage}\n\nError details: ${error.message.substring(0, 100)}...`,
//         [
//           {
//             text: 'Retry',
//             onPress: () => {
//               // Allow user to retry
//               console.log('User opted to retry transfer');
//             }
//           },
//           {
//             text: 'Cancel',
//             style: 'cancel'
//           }
//         ]
//       );
//     } finally {
//       setGiftLoading(false);
//     }
//   };

//   const handleGiftAmountChange = (text) => {
//     // Only allow numbers and decimal points
//     const sanitized = text.replace(/[^0-9.]/g, '');
    
//     // Prevent multiple decimal points
//     const parts = sanitized.split('.');
//     if (parts.length > 2) {
//       return;
//     }
    
//     // Limit decimal places to BONK_DECIMALS
//     if (parts[1] && parts[1].length > BONK_DECIMALS) {
//       parts[1] = parts[1].substring(0, BONK_DECIMALS);
//     }
    
//     const finalValue = parts.join('.');
//     setGiftAmount(finalValue);
//   };

//   // Enhanced setMaxGiftAmount function
//   const setMaxGiftAmount = () => {
//     if (userBonkBalance && userBonkBalance > 0) {
//       // Leave a small buffer for transaction fees
//       const maxAmount = Math.max(0, userBonkBalance - 0.001);
//       setGiftAmount(maxAmount.toString());
//     }
//   };

//   // Rest of the component remains the same...
//   const pickMedia = async () => {
//     launchImageLibrary(
//       { mediaType: 'mixed', selectionLimit: 5 },
//       response => {
//         if (response.didCancel) return;
//         if (response.errorCode) {
//           Alert.alert('Error', response.errorMessage || 'Media selection failed.');
//           return;
//         }
//         const assets = response.assets || [];
//         if (assets.length > 0) {
//           setSelectedMedia(assets);
//         }
//       },
//     );
//   };

//   const handleCreatePost = async () => {
//     if (!caption || selectedMedia.length === 0) {
//       Alert.alert('Missing fields', 'Caption and media are required.');
//       return;
//     }

//     try {
//       set

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const file = () => {
  return (
    <View>
      <Text>file</Text>
    </View>
  )
}

export default file

const styles = StyleSheet.create({})