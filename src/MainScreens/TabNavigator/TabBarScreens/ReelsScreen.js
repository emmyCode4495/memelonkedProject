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
//   Animated,
//   Easing,
//   Share,
//   ScrollView,
//   Dimensions,
// } from 'react-native';
// import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
// import axios from 'axios';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { launchImageLibrary } from 'react-native-image-picker';
// import LinearGradient from 'react-native-linear-gradient';
// import Video from 'react-native-video';
// import enndpoint from '../../../../constants/enndpoint';
// import CommentModal from '../../../components/CommentModal/CommentModal';
// import { AuthContext } from '../../../persistence/AuthContext';
// import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// import ReelsCommentModal from '../../../components/CommentModal/ReelsCommentModal';

// const { width, height } = Dimensions.get('window');

// // BONK Token Configuration
// const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
// const BONK_DECIMALS = 5;
// const SOLANA_NETWORK = 'mainnet-beta';

// // Web3 Color Palette
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
//  * Enhanced BONK Balance Hook
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

//     // Increase cooldown to reduce API calls
//     const now = Date.now();
//     if (!forceRefresh && lastFetched && (now - lastFetched) < 15000) { // 15 seconds cooldown
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
//         setLastFetched(now);
//       } else {
//         console.log('No BONK token account found');
//         setBalance(0);
//         setLastFetched(now);
//       }
//     } catch (err) {
//       console.error("[useBonkBalance] Error fetching balance:", err);
      
//       // Handle rate limiting specifically
//       if (err.message && err.message.includes('429')) {
//         setError(new Error('Rate limited - please wait before refreshing'));
//       } else {
//         setError(err instanceof Error ? err : new Error('Failed to fetch BONK balance'));
//       }
      
//       // Fallback: Check if we have any cached balance, otherwise set to 0
//       if (balance === null) {
//         setBalance(0);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [publicKey, lastFetched, balance]);

//   // Increase auto-refresh interval to reduce API calls
//   useEffect(() => {
//     if (publicKey) {
//       fetchBalance(true); // Initial fetch
      
//       const interval = setInterval(() => {
//         fetchBalance(false);
//       }, 60000); // 60 seconds instead of 30

//       return () => clearInterval(interval);
//     }
//   }, [publicKey, fetchBalance]);

//   return { balance, loading, error, fetchBalance, lastFetched };
// };

// const BalanceDisplay = ({ balance, loading, error, lastFetched, onRefresh }) => {
//   const [refreshing, setRefreshing] = useState(false);
  
//   const handleRefreshBalance = async () => {
//     setRefreshing(true);
//     await onRefresh(true);
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   return (
//     <View style={styles.balanceCard}>
//       <View style={styles.balanceHeader}>
//         <Text style={styles.balanceLabel}>Your BONK Balance</Text>
//         <TouchableOpacity 
//           style={styles.refreshButton}
//           onPress={handleRefreshBalance}
//           disabled={refreshing || loading}
//         >
//           <Ionicons 
//             name="refresh" 
//             size={16} 
//             color={web3Colors.primary} 
//             style={(refreshing || loading) ? { opacity: 0.5 } : {}}
//           />
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.balanceRow}>
//         <MaterialCommunityIcons name="dog" size={24} color={web3Colors.bonk} />
//         <Text style={styles.balanceAmount}>
//           {loading || refreshing ? 'Refreshing...' : 
//            balance !== null ? `${balance.toLocaleString()}` : '0'}
//         </Text>
//       </View>
      
//       {lastFetched && !loading && (
//         <Text style={styles.balanceTimestamp}>
//           Last updated: {new Date(lastFetched).toLocaleTimeString()}
//         </Text>
//       )}
      
//       {error && (
//         <Text style={styles.balanceError}>
//           Failed to fetch balance. Tap refresh to try again.
//         </Text>
//       )}
//     </View>
//   );
// };


// const getValidUserId = (user, walletInfo) => {
//   // Try different sources for userId
//   const possibleIds = [
//     user?.id,
//     user?.uid,
//     user?.userId,
//     walletInfo?.userId,
//     walletInfo?.id,
//     user?.email,
//     walletInfo?.address
//   ];
  
//   // Find the first valid ID
//   for (const id of possibleIds) {
//     if (id && typeof id === 'string' && id !== 'undefined' && id !== 'null') {
//       return id;
//     }
//   }
  
//   // Fallback to generating a temporary ID based on timestamp
//   return `temp_user_${Date.now()}`;
// };


// const ReelsScreen = () => {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [caption, setCaption] = useState('');
//   const [pov, setPov] = useState('');
//   const [videoUri, setVideoUri] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [visibleIndex, setVisibleIndex] = useState(0);
  
//   // Social features state
//   const [likedReels, setLikedReels] = useState({});
//   const [animatedScales, setAnimatedScales] = useState({});
//   const [commentModalVisible, setCommentModalVisible] = useState(false);
//   const [selectedReelId, setSelectedReelId] = useState(null);
//   const [giftModalVisible, setGiftModalVisible] = useState(false);
//   const [giftAmount, setGiftAmount] = useState('');
//   const [giftLoading, setGiftLoading] = useState(false);
//   const [selectedReel, setSelectedReel] = useState(null);
//   const [userPublicKey, setUserPublicKey] = useState(null);

//   const { user, walletInfo } = useContext(AuthContext);
  
//   // Get user's BONK balance
//   const { balance: userBonkBalance, loading: balanceLoading, fetchBalance } = useBonkBalance(userPublicKey);

//   const viewabilityConfig = { itemVisiblePercentThreshold: 80 };
//   const onViewRef = useRef(({ viewableItems }) => {
//     if (viewableItems.length > 0) {
//       setVisibleIndex(viewableItems[0].index);
//     }
//   });

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
        
//         if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanAddress) && cleanAddress.includes('=')) {
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

//   const fetchReels = async () => {
//     try {
//       const res = await axios.get(
//         `${enndpoint.main}/api/reels/get-all-reels`,
//       );
//       setReels(res.data.reels || []);
//     } catch (err) {
//       console.error('Failed to fetch reels:', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReels();
//   }, []);


// const handleLike = async reelId => {
//   if (likedReels[reelId]) return;

//   const newScale = new Animated.Value(0);
//   setAnimatedScales(prev => ({ ...prev, [reelId]: newScale }));

//   try {
//     setLikedReels(prev => ({ ...prev, [reelId]: true }));

//     Animated.sequence([
//       Animated.timing(newScale, {
//         toValue: 1.8,
//         duration: 250,
//         easing: Easing.out(Easing.back(2)),
//         useNativeDriver: true,
//       }),
//       Animated.timing(newScale, {
//         toValue: 1,
//         duration: 200,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }),
//     ]).start();

//     await axios.post(`${enndpoint.main}/api/reels/${reelId}/like`, {
//       userId: user?.id || 'user123',
//     });
    
//     // Update reel likes count locally - SAFER approach with detailed checks
//     setReels(prevReels => 
//       prevReels.map(reel => {
//         if (reel.id === reelId) {
//           // Debug log to see what we're working with
//           console.log('Current reel likes:', reel.likes, 'Type:', typeof reel.likes);
          
//           // Ensure likes is always a valid array
//           let currentLikes = [];
          
//           if (Array.isArray(reel.likes)) {
//             currentLikes = reel.likes;
//           } else if (reel.likes === null || reel.likes === undefined) {
//             currentLikes = [];
//           } else {
//             // Handle any other unexpected data types
//             console.warn('Unexpected likes data type:', typeof reel.likes, reel.likes);
//             currentLikes = [];
//           }
          
//           return {
//             ...reel,
//             likes: [...currentLikes, { userId: user?.id || 'user123' }]
//           };
//         }
        
//         return reel;
//       })
//     );
//   } catch (error) {
//     console.error('Error liking reel:', error.message);
//     setLikedReels(prev => ({ ...prev, [reelId]: false }));
//   }
// };

//   const openComments = reelId => {
//     setSelectedReelId(reelId);
//     setCommentModalVisible(true);
//   };

//   const handleShare = async reelId => {
//     try {
//       const reelLink = `https://your-app.com/reels/${reelId}`;
//       const result = await Share.share({
//         message: `🔥 Check out this amazing Web3 reel and send some BONK! ${reelLink}`,
//         url: reelLink,
//         title: '🚀 Epic Web3 Reel - BONK powered!',
//       });

//       if (result.action === Share.sharedAction) {
//         console.log('Reel shared successfully');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Unable to share the reel.');
//       console.error('Share Error:', error);
//     }
//   };

//  const openGiftModal = (reel) => {
//   if (!userPublicKey) {
//     Alert.alert('Wallet Required', 'Please connect your wallet to send BONK gifts.');
//     return;
//   }
  
//   // Force refresh balance when opening gift modal
//   if (fetchBalance) {
//     fetchBalance(true);
//   }
  
//   if (reel.userId === user?.id) {
//     Alert.alert('Invalid Action', 'You cannot send a gift to your own reel.');
//     return;
//   }

//   setSelectedReel(reel);
//   setSelectedReelId(reel.id);
//   setGiftModalVisible(true);
// };


//   const getRecipientWalletAddress = async (userId) => {
//     try {
//       const userRes = await axios.get(`${enndpoint.main}/api/users/${userId}`);
      
//       if (!userRes.data?.user?.walletAddress) {
//         throw new Error('Recipient wallet address not found');
//       }

//       return userRes.data.user.walletAddress;
//     } catch (error) {
//       console.error('Error fetching recipient wallet:', error);
//       throw error;
//     }
//   };

// const handleSendGift = async () => {
//   if (!giftAmount || isNaN(giftAmount) || parseFloat(giftAmount) <= 0) {
//     Alert.alert('Invalid Amount', 'Please enter a valid BONK amount greater than 0.');
//     return;
//   }

//   if (!userPublicKey) {
//     Alert.alert('Wallet Error', 'User wallet not found. Please reconnect your wallet.');
//     return;
//   }

//   if (!selectedReel?.userId) {
//     Alert.alert('Error', 'Recipient information not found.');
//     return;
//   }

//   const amount = parseFloat(giftAmount);

//   // Force refresh balance before validation
//   console.log('Refreshing balance before gift send...');
//   await fetchBalance(true);
  
//   // Wait a moment for balance to update
//   await new Promise(resolve => setTimeout(resolve, 1000));

//   console.log('Current balance check:', userBonkBalance, 'Required:', amount);

//   if (userBonkBalance === null) {
//     Alert.alert('Balance Error', 'Unable to fetch your BONK balance. Please try again.');
//     return;
//   }

//   if (userBonkBalance < amount) {
//     Alert.alert(
//       'Insufficient Balance', 
//       `You need ${amount.toLocaleString()} BONK but only have ${userBonkBalance.toLocaleString()} BONK.\n\nPlease add more BONK to your wallet or reduce the gift amount.`
//     );
//     return;
//   }

//   try {
//     setGiftLoading(true);

//     const recipientWalletAddress = await getRecipientWalletAddress(selectedReel.userId);

//     const giftData = {
//       senderId: user.id,
//       senderWallet: userPublicKey.toBase58(),
//       recipientId: selectedReel.userId,
//       recipientWallet: recipientWalletAddress,
//       reelId: selectedReelId,
//       amount: amount,
//       token: 'BONK',
//       status: 'pending',
//       // Add balance verification
//       senderBalanceAtTime: userBonkBalance
//     };

//     console.log('Sending gift with data:', giftData);

//     const giftResponse = await axios.post(`${enndpoint.main}/api/gifts/create`, giftData);
//     const giftId = giftResponse.data.giftId;

//     // Here you would normally do the actual blockchain transaction
//     // For now, we'll simulate it but you should replace this with real Solana transaction
//     console.log('Simulating BONK transfer...');
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     const simulatedTxSignature = `bonk_reel_gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     const transferData = {
//       giftId: giftId,
//       transactionSignature: simulatedTxSignature,
//       status: 'completed'
//     };

//     await axios.post(`${enndpoint.main}/api/gifts/complete`, transferData);

//     // Force refresh balance after successful transaction
//     console.log('Refreshing balance after successful gift...');
//     setTimeout(() => {
//       fetchBalance(true);
//     }, 2000);

//     // Update reel gifts count locally
//     setReels(prevReels => 
//       prevReels.map(reel => {
//         if (reel.id === selectedReelId) {
//           let currentGifts = [];
          
//           if (Array.isArray(reel.gifts)) {
//             currentGifts = reel.gifts;
//           } else if (reel.gifts === null || reel.gifts === undefined) {
//             currentGifts = [];
//           } else {
//             console.warn('Unexpected gifts data type:', typeof reel.gifts, reel.gifts);
//             currentGifts = [];
//           }
          
//           return {
//             ...reel,
//             gifts: [...currentGifts, { amount, token: 'BONK', userId: user.id }]
//           };
//         }
        
//         return reel;
//       })
//     );

//     Alert.alert(
//       'BONK Gift Sent! 🎁',
//       `Successfully sent ${amount.toLocaleString()} BONK for this amazing reel!\n\nTransaction: ${simulatedTxSignature.substring(0, 20)}...\n\nYour balance will update shortly.`,
//       [{
//         text: 'Awesome!',
//         onPress: () => {
//           setGiftModalVisible(false);
//           setGiftAmount('');
//           setSelectedReel(null);
//         }
//       }]
//     );

//   } catch (error) {
//     console.error('Gift sending error:', error);
    
//     let errorMessage = 'Failed to send BONK gift. Please try again.';
    
//     if (error.response?.status === 400) {
//       errorMessage = error.response.data?.message || 'Invalid gift request.';
//     } else if (error.response?.status === 404) {
//       errorMessage = 'Recipient not found or invalid wallet address.';
//     } else if (error.response?.status >= 500) {
//       errorMessage = 'Server error. Please try again later.';
//     }

//     Alert.alert('Gift Failed', errorMessage);
//   } finally {
//     setGiftLoading(false);
//   }
// };

// const BalanceCheckButton = () => (
//   <TouchableOpacity 
//     style={styles.balanceCheckButton}
//     onPress={() => fetchBalance(true)}
//     disabled={balanceLoading}
//   >
//     <LinearGradient
//       colors={[web3Colors.primary, web3Colors.secondary]}
//       style={styles.balanceCheckGradient}
//     >
//       <Ionicons name="wallet" size={16} color="white" />
//       <Text style={styles.balanceCheckText}>
//         {balanceLoading ? 'Checking...' : 'Check Balance'}
//       </Text>
//     </LinearGradient>
//   </TouchableOpacity>
// );




// // Enhanced handleGiftAmountChange function (replace your existing one)
// const handleGiftAmountChange = (text) => {
//   // Only allow numbers and decimal points
//   const sanitized = text.replace(/[^0-9.]/g, '');
  
//   // Prevent multiple decimal points
//   const parts = sanitized.split('.');
//   if (parts.length > 2) {
//     return;
//   }
  
//   // Limit decimal places to BONK_DECIMALS
//   if (parts[1] && parts[1].length > BONK_DECIMALS) {
//     parts[1] = parts[1].substring(0, BONK_DECIMALS);
//   }
  
//   const finalValue = parts.join('.');
//   setGiftAmount(finalValue);
// };

// // Enhanced setMaxGiftAmount function (replace your existing one)
// const setMaxGiftAmount = () => {
//   if (userBonkBalance && userBonkBalance > 0) {
//     // Leave a small buffer for transaction fees
//     const maxAmount = Math.max(0, userBonkBalance - 0.001);
//     setGiftAmount(maxAmount.toString());
//   }
// };


//   const handlePickVideo = async () => {
//     const options = {
//       mediaType: 'video',
//       videoQuality: 'high',
//       durationLimit: 60,
//     };

//     launchImageLibrary(options, response => {
//       if (response.didCancel) {
//         console.log('User cancelled video picker');
//       } else if (response.errorCode) {
//         console.error('ImagePicker Error:', response.errorMessage);
//         Alert.alert('Error', 'Failed to pick a video');
//       } else {
//         const uri = response.assets?.[0]?.uri;
//         if (uri) {
//           setVideoUri(uri);
//         }
//       }
//     });
//   };

//   const handleSubmit = async () => {
//     if (!caption || !videoUri) {
//       Alert.alert(
//         'Missing fields',
//         'Please provide a caption and select a video',
//       );
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const data = new FormData();
//       data.append('file', {
//         uri: videoUri,
//         type: 'video/mp4',
//         name: `reel_${Date.now()}.mp4`,
//       });
//       data.append('upload_preset', 'MemebonkedReels');
//       data.append('cloud_name', 'diwlfetpa');

//       const cloudinaryRes = await fetch(
//         'https://api.cloudinary.com/v1_1/diwlfetpa/video/upload',
//         {
//           method: 'POST',
//           body: data,
//         },
//       );

//       const cloudinaryData = await cloudinaryRes.json();

//       if (!cloudinaryData.secure_url) {
//         throw new Error(
//           cloudinaryData.error?.message || 'Cloudinary upload failed',
//         );
//       }

//       const reelData = {
//         userId: user?.id || '123',
//         caption,
//         pov,
//         videoUrl: cloudinaryData.secure_url,
//       };

//       const res = await axios.post(
//         `${enndpoint.main}/api/reels/create`,
//         reelData,
//       );

//       if (res.data?.reelId) {
//         setShowModal(false);
//         setCaption('');
//         setPov('');
//         setVideoUri(null);
//         fetchReels();
//       }
//     } catch (err) {
//       let message = 'Something went wrong';
//       if (err.response?.data?.error) {
//         message = err.response.data.error;
//       } else if (err.message) {
//         message = err.message;
//       }
//       Alert.alert('Error', message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const renderReel = ({ item, index }) => (
//     <View style={styles.reelContainer}>
//       <Video
//         source={{ uri: item.videoUrl }}
//         style={StyleSheet.absoluteFill}
//         resizeMode="cover"
//         repeat
//         muted={false}
//         controls={false}
//         paused={visibleIndex !== index}
//       />

//       {/* Enhanced Gradient Overlay */}
//       <LinearGradient
//         colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
//         style={styles.gradientOverlay}
//       />

//       {/* Glass Overlay with enhanced interactions */}
//       <View style={styles.glassOverlay}>
//         {/* POV Badge - TikTok style at top */}
//         {item.pov && (
//           <View style={styles.povBadgeTop}>
//             <LinearGradient
//               colors={['rgba(0,0,0,0.6)', 'rgba(148, 69, 255, 0.4)']}
//               style={styles.povBadgeTopGradient}
//             >
//            <Text style={styles.povTextTop}>
//                 POV:{' '}
//                 {item.pov.length > 100
//                   ? item.pov.slice(0, 100).split(' ').slice(0, -1).join(' ') + '...'
//                   : item.pov}
//               </Text>

//             </LinearGradient>
//           </View>
//         )}

//         {/* Enhanced Action icons on the right */}
//         <View style={styles.rightActions}>
//           {/* Like Button with Animation */}
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => handleLike(item.id)}
//             disabled={likedReels[item.id]}
//           >
//             <LinearGradient
//               colors={likedReels[item.id] 
//                 ? [web3Colors.accent, '#FF4757'] 
//                 : [web3Colors.gradient1, web3Colors.gradient2]
//               }
//               style={styles.actionButtonGradient}
//             >
//               {likedReels[item.id] ? (
//                 <Animated.View
//                   style={{
//                     transform: [
//                       { scale: animatedScales[item.id] || new Animated.Value(1) },
//                     ],
//                   }}
//                 >
//                   <Ionicons name="heart" size={26} color="white" />
//                 </Animated.View>
//               ) : (
//                 <Ionicons name="heart-outline" size={26} color="white" />
//               )}
//             </LinearGradient>
//             <Text style={styles.actionText}>
//               {(item.likes?.length || 0) + (likedReels[item.id] ? 1 : 0)}
//             </Text>
//           </TouchableOpacity>

//           {/* Comment Button */}
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => openComments(item.id)}
//           >
//             <LinearGradient
//               colors={[web3Colors.gradient2, web3Colors.primary]}
//               style={styles.actionButtonGradient}
//             >
//               <Ionicons name="chatbubble-outline" size={24} color="white" />
//             </LinearGradient>
//             <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
//           </TouchableOpacity>

//           {/* Enhanced Gift Button */}
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => openGiftModal(item)}
//           >
//             <LinearGradient
//               colors={[web3Colors.bonk, '#FF8C42']}
//               style={styles.actionButtonGradient}
//             >
//               <MaterialIcons name="card-giftcard" size={24} color="white" />
//             </LinearGradient>
//             <Text style={[styles.actionText, { color: web3Colors.bonk, fontWeight: 'bold' }]}>
//               {item.gifts?.length || 0}
//             </Text>
//           </TouchableOpacity>

//           {/* Share Button */}
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => handleShare(item.id)}
//           >
//             <LinearGradient
//               colors={[web3Colors.gradient3, web3Colors.secondary]}
//               style={styles.actionButtonGradient}
//             >
//               <Ionicons name="arrow-redo-outline" size={24} color="white" />
//             </LinearGradient>
//             <Text style={styles.actionText}>Share</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Enhanced Caption at bottom - TikTok style */}
//         <View style={styles.bottomInfo}>
//           <View style={styles.captionContainer}>
//             <View style={styles.userRow}>
//               <View style={styles.creatorAvatar}>
//                 <MaterialCommunityIcons name="account" size={20} color={web3Colors.text} />
//               </View>
//               <Text style={styles.creatorName}>@{item.caption}</Text>
//               <View style={styles.verifiedBadge}>
//                 <MaterialIcons name="verified" size={16} color={web3Colors.accent} />
//               </View>
//             </View>
            
//             {/* Stats Row */}
//             <View style={styles.reelStatsRow}>
//               <View style={styles.statChip}>
//                 <Ionicons name="heart" size={12} color={web3Colors.accent} />
//                 <Text style={styles.statChipText}>{(item.likes?.length || 0) + (likedReels[item.id] ? 1 : 0)}</Text>
//               </View>
//               <View style={styles.statChip}>
//                 <MaterialIcons name="card-giftcard" size={12} color={web3Colors.bonk} />
//                 <Text style={styles.statChipText}>{item.gifts?.length || 0} BONK</Text>
//               </View>
//               <View style={styles.statChip}>
//                 <MaterialCommunityIcons name="lightning-bolt" size={12} color={web3Colors.warning} />
//                 <Text style={styles.statChipText}>SOL</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <LinearGradient
//       colors={[web3Colors.background, '#1A1B3A', web3Colors.background]}
//       style={styles.container}
//     >
      
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <LinearGradient
//             colors={[web3Colors.gradient1, web3Colors.gradient2]}
//             style={styles.loadingGradient}
//           >
//             <ActivityIndicator size="large" color="white" />
//           </LinearGradient>
//           <Text style={styles.loadingText}>Loading BONK-powered Reels...</Text>
//         </View>
//       ) : reels.length === 0 ? (
//         <View style={styles.emptyState}>
//           <LinearGradient
//             colors={[web3Colors.cardBg, 'rgba(148, 69, 255, 0.1)']}
//             style={styles.emptyCard}
//           >
//             <Ionicons name="film" size={60} color={web3Colors.primary} />
//             <Text style={styles.emptyTitle}>No Reels Yet</Text>
//             <Text style={styles.emptySubtitle}>Be the first to create amazing Web3 content!</Text>
//           </LinearGradient>
//         </View>
//       ) : (
//         <FlatList
//           data={reels}
//           renderItem={renderReel}
//           keyExtractor={(item, index) => index.toString()}
//           pagingEnabled
//           showsVerticalScrollIndicator={false}
//           snapToAlignment="center"
//           decelerationRate="fast"
//           onViewableItemsChanged={onViewRef.current}
//           viewabilityConfig={viewabilityConfig}
//         />
//       )}

//       {/* Enhanced Floating Action Button - Moved higher to avoid overlap */}
//       <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
//         <LinearGradient
//           colors={[web3Colors.gradient1, web3Colors.gradient2, web3Colors.gradient3]}
//           style={styles.fabGradient}
//         >
//           <Ionicons name="add" size={28} color="white" />
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Comment Modal */}
//      <ReelsCommentModal
//   visible={commentModalVisible}
//   onClose={() => {
//     setCommentModalVisible(false);
//     setSelectedReelId(null);
//   }}
//   reelId={selectedReelId}
//   userId={getValidUserId(user, walletInfo)}
//   endpoint={enndpoint.main}
// />


//       {/* Enhanced Gift Modal */}
// <Modal visible={giftModalVisible} transparent animationType="slide">
//   <View style={styles.modalContainer}>
//     <View style={styles.giftModalContent}>
//       <LinearGradient
//         colors={[web3Colors.gradient1, web3Colors.gradient2]}
//         style={styles.giftModalHeader}
//       >
//         <MaterialIcons name="card-giftcard" size={32} color="white" />
//         <Text style={styles.giftModalTitle}>Send BONK Gift 🎁</Text>
//       </LinearGradient>

//       <ScrollView 
//         style={styles.giftModalBodyFixed}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >
//         {/* Enhanced Balance Display */}
//         <View style={styles.giftBalanceCard}>
//           <View style={styles.giftBalanceHeader}>
//             <Text style={styles.giftBalanceLabel}>Your BONK Balance</Text>
//             <TouchableOpacity 
//               style={styles.giftRefreshButton}
//               onPress={() => fetchBalance(true)}
//               disabled={balanceLoading}
//             >
//               <Ionicons 
//                 name="refresh" 
//                 size={16} 
//                 color={web3Colors.primary} 
//                 style={balanceLoading ? { opacity: 0.5 } : {}}
//               />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.giftBalanceRow}>
//             <MaterialCommunityIcons name="dog" size={24} color={web3Colors.bonk} />
//             <Text style={styles.giftBalanceAmount}>
//               {balanceLoading ? 'Refreshing...' : 
//                userBonkBalance !== null ? `${userBonkBalance.toLocaleString()}` : '0'}
//             </Text>
//           </View>
//         </View>

//         {/* Recipient Info */}
//         <View style={styles.giftRecipientCard}>
//           <Text style={styles.giftRecipientLabel}>Sending to creator:</Text>
//           <Text style={styles.giftRecipientName}>
//             @{selectedReel?.caption || 'Anonymous'}
//           </Text>
//           <Text style={styles.giftRecipientSubtext}>For their amazing reel! 🔥</Text>
//         </View>

//         {/* Amount Input */}
//         <View style={styles.giftInputContainer}>
//           <Text style={styles.giftInputLabel}>BONK Amount</Text>
//           <View style={styles.giftAmountInputRow}>
//             <TextInput
//               style={styles.giftAmountInput}
//               value={giftAmount}
//               onChangeText={handleGiftAmountChange}
//               placeholder="0.00"
//               placeholderTextColor={web3Colors.textSecondary}
//               keyboardType="numeric"
//               editable={!balanceLoading}
//             />
//             <TouchableOpacity 
//               style={[
//                 styles.giftMaxButton,
//                 (!userBonkBalance || userBonkBalance <= 0 || balanceLoading) && { opacity: 0.5 }
//               ]}
//               onPress={setMaxGiftAmount}
//               disabled={!userBonkBalance || userBonkBalance <= 0 || balanceLoading}
//             >
//               <Text style={styles.giftMaxButtonText}>MAX</Text>
//             </TouchableOpacity>
//           </View>
          
//           {/* Quick Amount Buttons */}
//           <View style={styles.giftQuickAmountContainer}>
//             {[100, 500, 1000, 5000].map((amount) => (
//               <TouchableOpacity
//                 key={amount}
//                 style={[
//                   styles.giftQuickAmountButton,
//                   (!userBonkBalance || userBonkBalance < amount || balanceLoading) && { opacity: 0.5 }
//                 ]}
//                 onPress={() => setGiftAmount(amount.toString())}
//                 disabled={!userBonkBalance || userBonkBalance < amount || balanceLoading}
//               >
//                 <Text style={[
//                   styles.giftQuickAmountText,
//                   (!userBonkBalance || userBonkBalance < amount || balanceLoading) && { color: web3Colors.textSecondary }
//                 ]}>
//                   {amount.toLocaleString()}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
          
//           {/* Balance validation message */}
//           {giftAmount && userBonkBalance !== null && parseFloat(giftAmount) > userBonkBalance && (
//             <Text style={styles.giftValidationErrorText}>
//               Insufficient balance. You have {userBonkBalance.toLocaleString()} BONK available.
//             </Text>
//           )}
//         </View>

//         {/* Reel Preview */}
//         <View style={styles.giftReelPreviewCard}>
//           <Text style={styles.giftPreviewLabel}>Gifting for this reel:</Text>
//           <View style={styles.giftMiniReelPreview}>
//             <Text style={styles.giftMiniReelCaption}>@{selectedReel?.caption}</Text>
//             {selectedReel?.pov && (
//               <Text style={styles.giftMiniReelPov}>POV: {selectedReel.pov}</Text>
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Action Buttons */}
//       <View style={styles.giftModalActions}>
//         <TouchableOpacity
//           style={styles.giftCancelButton}
//           onPress={() => {
//             setGiftModalVisible(false);
//             setGiftAmount('');
//             setSelectedReel(null);
//           }}
//           disabled={giftLoading}
//         >
//           <Text style={styles.giftCancelButtonText}>Cancel</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.giftSendButton, 
//             (giftLoading || 
//              !giftAmount || 
//              parseFloat(giftAmount) <= 0 || 
//              !userBonkBalance || 
//              parseFloat(giftAmount) > userBonkBalance ||
//              balanceLoading) && styles.giftSendButtonDisabled
//           ]}
//           onPress={handleSendGift}
//           disabled={
//             giftLoading || 
//             !giftAmount || 
//             parseFloat(giftAmount) <= 0 || 
//             !userBonkBalance || 
//             parseFloat(giftAmount) > userBonkBalance ||
//             balanceLoading
//           }
//         >
//           {giftLoading ? (
//             <ActivityIndicator size="small" color="white" />
//           ) : (
//             <>
//               <MaterialIcons name="send" size={18} color="white" />
//               <Text style={styles.giftSendButtonText}>
//                 Send {giftAmount ? parseFloat(giftAmount).toLocaleString() : ''} BONK
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   </View>
// </Modal>


//       {/* Create Reel Modal */}
//     <Modal animationType="slide" visible={showModal} transparent>
//   <View style={styles.modalContainer}>
//     <LinearGradient
//       colors={[web3Colors.background, '#1A1B3A']}
//       style={styles.modalContent}
//     >
//       <View style={styles.modalHeader}>
//         <Text style={styles.modalTitle}>Create Web3 Reel</Text>
//         <TouchableOpacity
//           onPress={() => setShowModal(false)}
//           style={styles.closeButton}
//         >
//           <Ionicons name="close" size={24} color={web3Colors.text} />
//         </TouchableOpacity>
//       </View>

//       {/* Fixed ScrollView with proper flex and contentContainerStyle */}
//       <ScrollView 
//         style={styles.createModalBody}
//         contentContainerStyle={styles.scrollViewContent}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>Caption</Text>
//           <TextInput
//             placeholder="What's happening in Web3?"
//             placeholderTextColor={web3Colors.textSecondary}
//             style={styles.captionInput}
//             value={caption}
//             onChangeText={setCaption}
//             multiline
//             numberOfLines={3}
//             textAlignVertical="top"
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>POV (Optional)</Text>
//           <TextInput
//             placeholder="Share your perspective..."
//             placeholderTextColor={web3Colors.textSecondary}
//             style={styles.input}
//             value={pov}
//             onChangeText={setPov}
//           />
//         </View>

//         <TouchableOpacity
//           style={styles.pickButton}
//           onPress={handlePickVideo}
//         >
//           <LinearGradient
//             colors={[web3Colors.gradient1, web3Colors.gradient2]}
//             style={styles.pickButtonGradient}
//           >
//             <Ionicons 
//               name={videoUri ? "videocam" : "add-circle"} 
//               size={20} 
//               color="white" 
//             />
//             <Text style={styles.pickButtonText}>
//               {videoUri ? 'Change Video' : 'Pick Video'}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         {videoUri && (
//           <View style={styles.videoPreview}>
//             <Text style={styles.previewLabel}>Preview:</Text>
//             <View style={styles.previewContainer}>
//               <Video
//                 source={{ uri: videoUri }}
//                 style={styles.previewVideo}
//                 controls
//                 resizeMode="cover"
//               />
//             </View>
//           </View>
//         )}

//         {/* Web3 Features Info */}
//         <View style={styles.featuresCard}>
//           <Text style={styles.featuresTitle}>🚀 Memelonked Reel Features</Text>
//           <Text style={styles.featuresText}>
//             • Earn BONK gifts from viewers{'\n'}
//             • Get likes and comments from the community{'\n'}
//             • Share with Solana ecosystem{'\n'}
//             • Build your Web3 creator profile
//           </Text>
//         </View>
//       </ScrollView>

//       <View style={styles.modalActions}>
//         <TouchableOpacity
//           style={styles.actionBtn}
//           onPress={handleSubmit}
//           disabled={submitting}
//         >
//           <LinearGradient
//             colors={submitting 
//               ? [web3Colors.textSecondary, web3Colors.textSecondary] 
//               : [web3Colors.success, web3Colors.secondary]
//             }
//             style={styles.actionBtnGradient}
//           >
//             {submitting ? (
//               <ActivityIndicator size="small" color="white" />
//             ) : (
//               <Ionicons name="rocket" size={20} color="white" />
//             )}
//             <Text style={styles.actionBtnText}>
//               {submitting ? 'Launching...' : 'Launch Reel'}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.actionBtn}
//           onPress={() => setShowModal(false)}
//         >
//           <LinearGradient
//             colors={[web3Colors.cardBg, web3Colors.border]}
//             style={styles.actionBtnGradient}
//           >
//             <Ionicons name="close-circle" size={20} color="white" />
//             <Text style={styles.actionBtnText}>Cancel</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   </View>
// </Modal>
//     </LinearGradient>
//   );
// };

// export default ReelsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingGradient: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     fontWeight: '500',
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyCard: {
//     padding: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   emptyTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     textAlign: 'center',
//   },
//   reelContainer: {
//     height: height,
//     position: 'relative',
//     backgroundColor: '#000',
//   },
//   gradientOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   glassOverlay: {
//     flex: 1,
//     justifyContent: 'space-between',
//     padding: 20,
//   },
//   rightActions: {
//     position: 'absolute',
//     left: 15,
//     bottom: 230, 
//     alignItems: 'center',
//   },
//   actionButton: {
//     marginVertical: 15,
//     alignItems: 'center',
//   },
//   actionButtonGradient: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   actionText: {
//     color: web3Colors.text,
//     fontSize: 12,
//     marginTop: 8,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   bottomInfo: {
//     position: 'absolute',
//     bottom: "20%",
//     left: "15%",
//     right: "25%",
//   },
//   captionContainer: {
//     backgroundColor: web3Colors.glassOverlay,
//     borderRadius: 20,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   userRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   creatorAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: web3Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   creatorName: {
//     color: web3Colors.text,
//     fontSize: 16,
//     fontWeight: 'bold',
//     flex: 1,
//   },
//   verifiedBadge: {
//     marginLeft: 6,
//   },
//   // POV Badge at top - TikTok style
//   povBadgeTop: {
//     position: 'absolute',
//     top: 100,
//     // left: "40%",
//     zIndex: 10,

//   },
//   povBadgeTopGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // paddingHorizontal: 12,
//     // paddingVertical: 6,
//     padding: 20,
//     borderRadius: 20,
//     gap: 4,
//   },
//   povTextTop: {
//     color: 'white',
//     fontSize: 30,
//     fontWeight: '600',
//   },
//   reelStatsRow: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   statChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statChipText: {
//     color: web3Colors.text,
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 150, // Moved higher to avoid overlap with share button
//     right: 20,
//     elevation: 8,
//     shadowColor: web3Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   fabGradient: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   // Modal Styles
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: web3Colors.darkOverlay,
//     padding: 20,
//   },
  
//   // Gift Modal Styles
//   giftModalContent: {
//     backgroundColor: web3Colors.cardBg,
//     borderRadius: 20,
//     maxHeight: '85%',
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   giftModalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     gap: 10,
//   },
//   giftModalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//   },
 

//   inputContainer: {
//     marginHorizontal: 16,
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 14,
//     color: web3Colors.textSecondary,
//     marginBottom: 8,
//   },

 
//   quickAmountDisabled: {
//     color: web3Colors.textSecondary,
//   },

//   previewLabel: {
//     fontSize: 14,
//     color: web3Colors.textSecondary,
//     marginBottom: 8,
//   },
  
//   // Create Modal Styles
//   modalContent: {
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     elevation: 10,
//     shadowColor: web3Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     maxHeight: '90%', // Ensure modal doesn't exceed screen
//     minHeight: 400, // Minimum height to ensure content is visible
//   },
  
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: web3Colors.border,
//   },
  
//   createModalBody: {
//     flex: 1, // This is crucial - gives the ScrollView flex space
//     paddingHorizontal: 20,
//   },

//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: web3Colors.glassOverlay,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
 
//    input: {
//     backgroundColor: web3Colors.cardBg,
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: web3Colors.text,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     minHeight: 50, // Ensure minimum height
//   },

//    inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: web3Colors.text,
//     marginBottom: 8,
//   },
  
//    scrollViewContent: {
//     paddingVertical: 10,
//     paddingBottom: 20, // Extra padding at bottom
//   },
  
//   inputContainer: {
//     marginBottom: 20,
//   },

//  captionInput: {
//     backgroundColor: web3Colors.cardBg,
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: web3Colors.text,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     textAlignVertical: 'top',
//     minHeight: 80,
//   },

//   pickButton: {
//     marginBottom: 20,
//   },
//   pickButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     borderRadius: 12,
//   },
//   pickButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   videoPreview: {
//     marginBottom: 24,
//   },
//   previewContainer: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   previewVideo: {
//     width: '100%',
//     height: 200,
//     backgroundColor: '#000',
//   },
//   featuresCard: {
//     backgroundColor: web3Colors.background,
//     marginBottom: 16,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   featuresTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginBottom: 8,
//   },
//   featuresText: {
//     fontSize: 14,
//     color: web3Colors.textSecondary,
//     lineHeight: 20,
//   },
//    modalActions: {
//     flexDirection: 'row',
//     padding: 20,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: web3Colors.border,
//     gap: 12,
//   },
  
//   actionBtn: {
//     flex: 1,
//     marginHorizontal: 6,
//   },
//   actionBtnGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     borderRadius: 12,
//   },
//   actionBtnText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },

//     balanceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
  
//   refreshButton: {
//     padding: 4,
//   },
  
//   balanceTimestamp: {
//     fontSize: 10,
//     color: web3Colors.textSecondary,
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
  
//   balanceError: {
//     fontSize: 10,
//     color: web3Colors.accent,
//     marginTop: 4,
//   },

//     balanceCheckButton: {
//     marginVertical: 8,
//   },
  
//   balanceCheckGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     gap: 6,
//   },
  
//   balanceCheckText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '600',
//   },

//     maxButtonDisabled: {
//     opacity: 0.5,
//     backgroundColor: web3Colors.border,
//   },
//   maxButtonTextDisabled: {
//     opacity: 0.5,
//   },
//   quickAmountButtonDisabled: {
//     opacity: 0.5,
//     backgroundColor: web3Colors.border,
//   },
//   validationError: {
//     color: web3Colors.accent,
//     fontSize: 12,
//     marginTop: 8,
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   usdEquivalent: {
//     color: web3Colors.textSecondary,
//     fontSize: 11,
//     marginTop: 4,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   transactionInfoCard: {
//     backgroundColor: web3Colors.background,
//     marginHorizontal: 16,
//     marginBottom: 16,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   transactionInfoTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginBottom: 12,
//   },
//   transactionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   transactionLabel: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//   },
//   transactionValue: {
//     fontSize: 12,
//     color: web3Colors.text,
//     fontWeight: '500',
//   },
//   giftModalBodyFixed: {
//   flex: 1,
//   paddingVertical: 10,
// },

// validationErrorText: {
//   color: web3Colors.accent,
//   fontSize: 12,
//   marginTop: 8,
//   textAlign: 'center',
//   fontWeight: '500',
// },

// giftModalContent: {
//   backgroundColor: web3Colors.cardBg,
//   borderRadius: 20,
//   height: '85%', // Fixed height instead of maxHeight
//   borderWidth: 1,
//   borderColor: web3Colors.border,
// },

// giftModalHeader: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'center',
//   paddingVertical: 20,
//   paddingHorizontal: 20,
//   borderTopLeftRadius: 20,
//   borderTopRightRadius: 20,
//   gap: 10,
// },

// giftModalTitle: {
//   fontSize: 20,
//   fontWeight: 'bold',
//   color: 'white',
// },

// giftModalBodyFixed: {
//   flex: 1,
//   paddingVertical: 10,
// },

// // Gift Modal Balance Card
// giftBalanceCard: {
//   backgroundColor: web3Colors.background,
//   margin: 16,
//   padding: 16,
//   borderRadius: 12,
//   borderWidth: 1,
//   borderColor: web3Colors.border,
// },

// giftBalanceHeader: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   marginBottom: 8,
// },

// giftBalanceLabel: {
//   fontSize: 14,
//   color: web3Colors.textSecondary,
//   marginBottom: 8,
// },

// giftBalanceRow: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: 8,
// },

// giftBalanceAmount: {
//   fontSize: 20,
//   fontWeight: 'bold',
//   color: web3Colors.bonk,
// },

// giftRefreshButton: {
//   padding: 4,
// },

// // Gift Modal Recipient Card
// giftRecipientCard: {
//   backgroundColor: web3Colors.background,
//   marginHorizontal: 16,
//   marginBottom: 16,
//   padding: 16,
//   borderRadius: 12,
//   borderWidth: 1,
//   borderColor: web3Colors.border,
// },

// giftRecipientLabel: {
//   fontSize: 14,
//   color: web3Colors.textSecondary,
//   marginBottom: 4,
// },

// giftRecipientName: {
//   fontSize: 16,
//   fontWeight: 'bold',
//   color: web3Colors.text,
//   marginBottom: 4,
// },

// giftRecipientSubtext: {
//   fontSize: 12,
//   color: web3Colors.textSecondary,
//   fontStyle: 'italic',
// },

// // Gift Modal Input Section
// giftInputContainer: {
//   marginHorizontal: 16,
//   marginBottom: 16,
// },

// giftInputLabel: {
//   fontSize: 14,
//   color: web3Colors.textSecondary,
//   marginBottom: 8,
// },

// giftAmountInputRow: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: 8,
// },

// giftAmountInput: {
//   flex: 1,
//   backgroundColor: web3Colors.background,
//   borderWidth: 1,
//   borderColor: web3Colors.border,
//   borderRadius: 12,
//   paddingHorizontal: 16,
//   paddingVertical: 12,
//   fontSize: 18,
//   color: web3Colors.text,
//   fontWeight: 'bold',
// },

// giftMaxButton: {
//   backgroundColor: web3Colors.accent,
//   paddingHorizontal: 16,
//   paddingVertical: 12,
//   borderRadius: 12,
// },

// giftMaxButtonText: {
//   fontSize: 14,
//   fontWeight: 'bold',
//   color: 'white',
// },

// giftQuickAmountContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   marginTop: 12,
//   gap: 8,
// },

// giftQuickAmountButton: {
//   flex: 1,
//   backgroundColor: web3Colors.border,
//   paddingVertical: 8,
//   borderRadius: 8,
//   alignItems: 'center',
// },

// giftQuickAmountText: {
//   fontSize: 12,
//   color: web3Colors.text,
//   fontWeight: '600',
// },

// // Gift Modal Reel Preview
// giftReelPreviewCard: {
//   backgroundColor: web3Colors.background,
//   marginHorizontal: 16,
//   marginBottom: 16,
//   padding: 16,
//   borderRadius: 12,
//   borderWidth: 1,
//   borderColor: web3Colors.border,
// },

// giftPreviewLabel: {
//   fontSize: 14,
//   color: web3Colors.textSecondary,
//   marginBottom: 8,
// },

// giftMiniReelPreview: {
//   backgroundColor: web3Colors.cardBg,
//   padding: 12,
//   borderRadius: 8,
// },

// giftMiniReelCaption: {
//   fontSize: 14,
//   color: web3Colors.text,
//   fontWeight: 'bold',
//   marginBottom: 4,
// },

// giftMiniReelPov: {
//   fontSize: 12,
//   color: web3Colors.textSecondary,
// },

// // Gift Modal Actions
// giftModalActions: {
//   flexDirection: 'row',
//   padding: 16,
//   gap: 12,
//   borderTopWidth: 1,
//   borderTopColor: web3Colors.border,
// },

// giftCancelButton: {
//   flex: 1,
//   paddingVertical: 14,
//   borderRadius: 12,
//   borderWidth: 1,
//   borderColor: web3Colors.border,
//   alignItems: 'center',
// },

// giftCancelButtonText: {
//   fontSize: 16,
//   color: web3Colors.textSecondary,
//   fontWeight: '600',
// },

// giftSendButton: {
//   flex: 2,
//   backgroundColor: web3Colors.bonk,
//   paddingVertical: 14,
//   borderRadius: 12,
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'center',
//   gap: 8,
// },

// giftSendButtonDisabled: {
//   backgroundColor: web3Colors.border,
// },

// giftSendButtonText: {
//   fontSize: 16,
//   color: 'white',
//   fontWeight: 'bold',
// },

// // Validation and Error Messages
// giftValidationErrorText: {
//   color: web3Colors.accent,
//   fontSize: 12,
//   marginTop: 8,
//   textAlign: 'center',
//   fontWeight: '500',
// },
// });


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
  Animated,
  Easing,
  Share,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useFocusEffect } from '@react-navigation/native';
import enndpoint from '../../../../constants/enndpoint';
import CommentModal from '../../../components/CommentModal/CommentModal';
import { AuthContext } from '../../../persistence/AuthContext';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import ReelsCommentModal from '../../../components/CommentModal/ReelsCommentModal';

const { width, height } = Dimensions.get('window');

// BONK Token Configuration
const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
const BONK_DECIMALS = 5;
const SOLANA_NETWORK = 'mainnet-beta';

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
 * Enhanced BONK Balance Hook
 */
const useBonkBalance = (publicKey) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchBalance = useCallback(async (forceRefresh = false) => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    // Increase cooldown to reduce API calls
    const now = Date.now();
    if (!forceRefresh && lastFetched && (now - lastFetched) < 15000) { // 15 seconds cooldown
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching BONK balance for:', publicKey.toBase58());
      
      // Use alternative RPC endpoints with better rate limits
      const RPC_ENDPOINTS = [
        process.env.REACT_APP_RPC_URL,
        'https://api.mainnet-beta.solana.com',
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana',
        clusterApiUrl(SOLANA_NETWORK)
      ].filter(Boolean);
      
      let connection;
      let lastError;
      
      // Try different RPC endpoints if one fails
      for (const endpoint of RPC_ENDPOINTS) {
        try {
          connection = new Connection(endpoint, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 30000,
          });
          
          // Test the connection with a simple call first
          await connection.getSlot();
          break;
        } catch (err) {
          lastError = err;
          console.log(`RPC endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }
      
      if (!connection) {
        throw lastError || new Error('All RPC endpoints failed');
      }
      
      // Get all token accounts for this wallet
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(BONK_MINT_ADDRESS),
      });

      console.log('Token accounts found:', accounts.value.length);

      if (accounts.value.length > 0) {
        const accountInfo = accounts.value[0].account.data.parsed.info;
        const tokenBalance = accountInfo.tokenAmount.uiAmount || 0;
        console.log('Raw BONK balance:', tokenBalance);
        setBalance(tokenBalance);
        setLastFetched(now);
      } else {
        console.log('No BONK token account found');
        setBalance(0);
        setLastFetched(now);
      }
    } catch (err) {
      console.error("[useBonkBalance] Error fetching balance:", err);
      
      // Handle rate limiting specifically
      if (err.message && err.message.includes('429')) {
        setError(new Error('Rate limited - please wait before refreshing'));
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch BONK balance'));
      }
      
      // Fallback: Check if we have any cached balance, otherwise set to 0
      if (balance === null) {
        setBalance(0);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, lastFetched, balance]);

  // Increase auto-refresh interval to reduce API calls
  useEffect(() => {
    if (publicKey) {
      fetchBalance(true); // Initial fetch
      
      const interval = setInterval(() => {
        fetchBalance(false);
      }, 60000); // 60 seconds instead of 30

      return () => clearInterval(interval);
    }
  }, [publicKey, fetchBalance]);

  return { balance, loading, error, fetchBalance, lastFetched };
};

const BalanceDisplay = ({ balance, loading, error, lastFetched, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await onRefresh(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Your BONK Balance</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshBalance}
          disabled={refreshing || loading}
        >
          <Ionicons 
            name="refresh" 
            size={16} 
            color={web3Colors.primary} 
            style={(refreshing || loading) ? { opacity: 0.5 } : {}}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceRow}>
        <MaterialCommunityIcons name="dog" size={24} color={web3Colors.bonk} />
        <Text style={styles.balanceAmount}>
          {loading || refreshing ? 'Refreshing...' : 
           balance !== null ? `${balance.toLocaleString()}` : '0'}
        </Text>
      </View>
      
      {lastFetched && !loading && (
        <Text style={styles.balanceTimestamp}>
          Last updated: {new Date(lastFetched).toLocaleTimeString()}
        </Text>
      )}
      
      {error && (
        <Text style={styles.balanceError}>
          Failed to fetch balance. Tap refresh to try again.
        </Text>
      )}
    </View>
  );
};

const getValidUserId = (user, walletInfo) => {
  // Try different sources for userId
  const possibleIds = [
    user?.id,
    user?.uid,
    user?.userId,
    walletInfo?.userId,
    walletInfo?.id,
    user?.email,
    walletInfo?.address
  ];
  
  // Find the first valid ID
  for (const id of possibleIds) {
    if (id && typeof id === 'string' && id !== 'undefined' && id !== 'null') {
      return id;
    }
  }
  
  // Fallback to generating a temporary ID based on timestamp
  return `temp_user_${Date.now()}`;
};

const ReelsScreen = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [pov, setPov] = useState('');
  const [videoUri, setVideoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  
  // Screen focus state - NEW
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  
  // Social features state
  const [likedReels, setLikedReels] = useState({});
  const [animatedScales, setAnimatedScales] = useState({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState(null);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState(null);

  const { user, walletInfo } = useContext(AuthContext);
  
  // Get user's BONK balance
  const { balance: userBonkBalance, loading: balanceLoading, fetchBalance } = useBonkBalance(userPublicKey);

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  });

  // NEW: Handle screen focus/blur events
  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      setIsScreenFocused(true);
      console.log('ReelsScreen focused - videos can play');
      
      return () => {
        // Screen is blurred/unfocused
        setIsScreenFocused(false);
        console.log('ReelsScreen unfocused - videos paused');
      };
    }, [])
  );

  // Convert wallet address to PublicKey on component mount
  useEffect(() => {
    const setupWallet = () => {
      const walletAddress = user?.walletAddress || walletInfo?.address;
      
      if (!walletAddress) {
        console.log('No wallet address found');
        return;
      }

      try {
        let publicKey;
        let cleanAddress = walletAddress.trim();
        
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanAddress) && cleanAddress.includes('=')) {
          const binaryString = atob(cleanAddress);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          publicKey = new PublicKey(bytes);
        } else if (cleanAddress instanceof Uint8Array || Buffer.isBuffer(cleanAddress)) {
          publicKey = new PublicKey(cleanAddress);
        } else if (Array.isArray(cleanAddress)) {
          publicKey = new PublicKey(new Uint8Array(cleanAddress));
        } else if (typeof cleanAddress === 'string') {
          publicKey = new PublicKey(cleanAddress);
        }
        
        setUserPublicKey(publicKey);
        console.log('User wallet public key set:', publicKey.toBase58());
      } catch (error) {
        console.error('Error converting wallet address to PublicKey:', error);
      }
    };

    setupWallet();
  }, [user, walletInfo]);

  const fetchReels = async () => {
    try {
      const res = await axios.get(
        `${enndpoint.main}/api/reels/get-all-reels`,
      );
      setReels(res.data.reels || []);
    } catch (err) {
      console.error('Failed to fetch reels:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleLike = async reelId => {
    if (likedReels[reelId]) return;

    const newScale = new Animated.Value(0);
    setAnimatedScales(prev => ({ ...prev, [reelId]: newScale }));

    try {
      setLikedReels(prev => ({ ...prev, [reelId]: true }));

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

      await axios.post(`${enndpoint.main}/api/reels/${reelId}/like`, {
        userId: user?.id || 'user123',
      });
      
      // Update reel likes count locally - SAFER approach with detailed checks
      setReels(prevReels => 
        prevReels.map(reel => {
          if (reel.id === reelId) {
            // Debug log to see what we're working with
            console.log('Current reel likes:', reel.likes, 'Type:', typeof reel.likes);
            
            // Ensure likes is always a valid array
            let currentLikes = [];
            
            if (Array.isArray(reel.likes)) {
              currentLikes = reel.likes;
            } else if (reel.likes === null || reel.likes === undefined) {
              currentLikes = [];
            } else {
              // Handle any other unexpected data types
              console.warn('Unexpected likes data type:', typeof reel.likes, reel.likes);
              currentLikes = [];
            }
            
            return {
              ...reel,
              likes: [...currentLikes, { userId: user?.id || 'user123' }]
            };
          }
          
          return reel;
        })
      );
    } catch (error) {
      console.error('Error liking reel:', error.message);
      setLikedReels(prev => ({ ...prev, [reelId]: false }));
    }
  };

  const openComments = reelId => {
    setSelectedReelId(reelId);
    setCommentModalVisible(true);
  };

  const handleShare = async reelId => {
    try {
      const reelLink = `https://your-app.com/reels/${reelId}`;
      const result = await Share.share({
        message: `🔥 Check out this amazing Web3 reel and send some BONK! ${reelLink}`,
        url: reelLink,
        title: '🚀 Epic Web3 Reel - BONK powered!',
      });

      if (result.action === Share.sharedAction) {
        console.log('Reel shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share the reel.');
      console.error('Share Error:', error);
    }
  };

  const openGiftModal = (reel) => {
    if (!userPublicKey) {
      Alert.alert('Wallet Required', 'Please connect your wallet to send BONK gifts.');
      return;
    }
    
    // Force refresh balance when opening gift modal
    if (fetchBalance) {
      fetchBalance(true);
    }
    
    if (reel.userId === user?.id) {
      Alert.alert('Invalid Action', 'You cannot send a gift to your own reel.');
      return;
    }

    setSelectedReel(reel);
    setSelectedReelId(reel.id);
    setGiftModalVisible(true);
  };

  const getRecipientWalletAddress = async (userId) => {
    try {
      const userRes = await axios.get(`${enndpoint.main}/api/users/${userId}`);
      
      if (!userRes.data?.user?.walletAddress) {
        throw new Error('Recipient wallet address not found');
      }

      return userRes.data.user.walletAddress;
    } catch (error) {
      console.error('Error fetching recipient wallet:', error);
      throw error;
    }
  };

  const handleSendGift = async () => {
    if (!giftAmount || isNaN(giftAmount) || parseFloat(giftAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid BONK amount greater than 0.');
      return;
    }

    if (!userPublicKey) {
      Alert.alert('Wallet Error', 'User wallet not found. Please reconnect your wallet.');
      return;
    }

    if (!selectedReel?.userId) {
      Alert.alert('Error', 'Recipient information not found.');
      return;
    }

    const amount = parseFloat(giftAmount);

    // Force refresh balance before validation
    console.log('Refreshing balance before gift send...');
    await fetchBalance(true);
    
    // Wait a moment for balance to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Current balance check:', userBonkBalance, 'Required:', amount);

    if (userBonkBalance === null) {
      Alert.alert('Balance Error', 'Unable to fetch your BONK balance. Please try again.');
      return;
    }

    if (userBonkBalance < amount) {
      Alert.alert(
        'Insufficient Balance', 
        `You need ${amount.toLocaleString()} BONK but only have ${userBonkBalance.toLocaleString()} BONK.\n\nPlease add more BONK to your wallet or reduce the gift amount.`
      );
      return;
    }

    try {
      setGiftLoading(true);

      const recipientWalletAddress = await getRecipientWalletAddress(selectedReel.userId);

      const giftData = {
        senderId: user.id,
        senderWallet: userPublicKey.toBase58(),
        recipientId: selectedReel.userId,
        recipientWallet: recipientWalletAddress,
        reelId: selectedReelId,
        amount: amount,
        token: 'BONK',
        status: 'pending',
        // Add balance verification
        senderBalanceAtTime: userBonkBalance
      };

      console.log('Sending gift with data:', giftData);

      const giftResponse = await axios.post(`${enndpoint.main}/api/gifts/create`, giftData);
      const giftId = giftResponse.data.giftId;

      // Here you would normally do the actual blockchain transaction
      // For now, we'll simulate it but you should replace this with real Solana transaction
      console.log('Simulating BONK transfer...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedTxSignature = `bonk_reel_gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const transferData = {
        giftId: giftId,
        transactionSignature: simulatedTxSignature,
        status: 'completed'
      };

      await axios.post(`${enndpoint.main}/api/gifts/complete`, transferData);

      // Force refresh balance after successful transaction
      console.log('Refreshing balance after successful gift...');
      setTimeout(() => {
        fetchBalance(true);
      }, 2000);

      // Update reel gifts count locally
      setReels(prevReels => 
        prevReels.map(reel => {
          if (reel.id === selectedReelId) {
            let currentGifts = [];
            
            if (Array.isArray(reel.gifts)) {
              currentGifts = reel.gifts;
            } else if (reel.gifts === null || reel.gifts === undefined) {
              currentGifts = [];
            } else {
              console.warn('Unexpected gifts data type:', typeof reel.gifts, reel.gifts);
              currentGifts = [];
            }
            
            return {
              ...reel,
              gifts: [...currentGifts, { amount, token: 'BONK', userId: user.id }]
            };
          }
          
          return reel;
        })
      );

      Alert.alert(
        'BONK Gift Sent! 🎁',
        `Successfully sent ${amount.toLocaleString()} BONK for this amazing reel!\n\nTransaction: ${simulatedTxSignature.substring(0, 20)}...\n\nYour balance will update shortly.`,
        [{
          text: 'Awesome!',
          onPress: () => {
            setGiftModalVisible(false);
            setGiftAmount('');
            setSelectedReel(null);
          }
        }]
      );

    } catch (error) {
      console.error('Gift sending error:', error);
      
      let errorMessage = 'Failed to send BONK gift. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid gift request.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Recipient not found or invalid wallet address.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      Alert.alert('Gift Failed', errorMessage);
    } finally {
      setGiftLoading(false);
    }
  };

  const BalanceCheckButton = () => (
    <TouchableOpacity 
      style={styles.balanceCheckButton}
      onPress={() => fetchBalance(true)}
      disabled={balanceLoading}
    >
      <LinearGradient
        colors={[web3Colors.primary, web3Colors.secondary]}
        style={styles.balanceCheckGradient}
      >
        <Ionicons name="wallet" size={16} color="white" />
        <Text style={styles.balanceCheckText}>
          {balanceLoading ? 'Checking...' : 'Check Balance'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Enhanced handleGiftAmountChange function (replace your existing one)
  const handleGiftAmountChange = (text) => {
    // Only allow numbers and decimal points
    const sanitized = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to BONK_DECIMALS
    if (parts[1] && parts[1].length > BONK_DECIMALS) {
      parts[1] = parts[1].substring(0, BONK_DECIMALS);
    }
    
    const finalValue = parts.join('.');
    setGiftAmount(finalValue);
  };

  // Enhanced setMaxGiftAmount function (replace your existing one)
  const setMaxGiftAmount = () => {
    if (userBonkBalance && userBonkBalance > 0) {
      // Leave a small buffer for transaction fees
      const maxAmount = Math.max(0, userBonkBalance - 0.001);
      setGiftAmount(maxAmount.toString());
    }
  };

  const handlePickVideo = async () => {
    const options = {
      mediaType: 'video',
      videoQuality: 'high',
      durationLimit: 60,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', 'Failed to pick a video');
      } else {
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setVideoUri(uri);
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!caption || !videoUri) {
      Alert.alert(
        'Missing fields',
        'Please provide a caption and select a video',
      );
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append('file', {
        uri: videoUri,
        type: 'video/mp4',
        name: `reel_${Date.now()}.mp4`,
      });
      data.append('upload_preset', 'MemebonkedReels');
      data.append('cloud_name', 'diwlfetpa');

      const cloudinaryRes = await fetch(
        'https://api.cloudinary.com/v1_1/diwlfetpa/video/upload',
        {
          method: 'POST',
          body: data,
        },
      );

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryData.secure_url) {
        throw new Error(
          cloudinaryData.error?.message || 'Cloudinary upload failed',
        );
      }

      const reelData = {
        userId: user?.id || '123',
        caption,
        pov,
        videoUrl: cloudinaryData.secure_url,
      };

      const res = await axios.post(
        `${enndpoint.main}/api/reels/create`,
        reelData,
      );

      if (res.data?.reelId) {
        setShowModal(false);
        setCaption('');
        setPov('');
        setVideoUri(null);
        fetchReels();
      }
    } catch (err) {
      let message = 'Something went wrong';
      if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.message) {
        message = err.message;
      }
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  // MODIFIED: Enhanced renderReel with screen focus detection
  const renderReel = ({ item, index }) => {
    // Video should play only if:
    // 1. Screen is focused
    // 2. This reel is the visible/active one
    // 3. No modals are open
    const shouldPlayVideo = isScreenFocused && 
                           visibleIndex === index && 
                           !showModal && 
                           !commentModalVisible && 
                           !giftModalVisible;

    console.log(`Reel ${index}: shouldPlayVideo = ${shouldPlayVideo}, isScreenFocused = ${isScreenFocused}, visibleIndex = ${visibleIndex}`);

    return (
      <View style={styles.reelContainer}>
        <Video
          source={{ uri: item.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted={false}
          controls={false}
          paused={!shouldPlayVideo} // MODIFIED: Use combined condition
        />

        {/* Enhanced Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />

        {/* Glass Overlay with enhanced interactions */}
        <View style={styles.glassOverlay}>
          {/* POV Badge - TikTok style at top */}
          {item.pov && (
            <View style={styles.povBadgeTop}>
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(148, 69, 255, 0.4)']}
                style={styles.povBadgeTopGradient}
              >
             <Text style={styles.povTextTop}>
                  POV:{' '}
                  {item.pov.length > 100
                    ? item.pov.slice(0, 100).split(' ').slice(0, -1).join(' ') + '...'
                    : item.pov}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Enhanced Action icons on the right */}
          <View style={styles.rightActions}>
            {/* Like Button with Animation */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
              disabled={likedReels[item.id]}
            >
              <LinearGradient
                colors={likedReels[item.id] 
                  ? [web3Colors.accent, '#FF4757'] 
                  : [web3Colors.gradient1, web3Colors.gradient2]
                }
                style={styles.actionButtonGradient}
              >
                {likedReels[item.id] ? (
                  <Animated.View
                    style={{
                      transform: [
                        { scale: animatedScales[item.id] || new Animated.Value(1) },
                      ],
                    }}
                  >
                    <Ionicons name="heart" size={26} color="white" />
                  </Animated.View>
                ) : (
                  <Ionicons name="heart-outline" size={26} color="white" />
                )}
              </LinearGradient>
              <Text style={styles.actionText}>
                {(item.likes?.length || 0) + (likedReels[item.id] ? 1 : 0)}
              </Text>
            </TouchableOpacity>

            {/* Comment Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openComments(item.id)}
            >
              <LinearGradient
                colors={[web3Colors.gradient2, web3Colors.primary]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="chatbubble-outline" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
            </TouchableOpacity>

            {/* Enhanced Gift Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openGiftModal(item)}
            >
              <LinearGradient
                colors={[web3Colors.bonk, '#FF8C42']}
                style={styles.actionButtonGradient}
              >
                <MaterialIcons name="card-giftcard" size={24} color="white" />
              </LinearGradient>
              <Text style={[styles.actionText, { color: web3Colors.bonk, fontWeight: 'bold' }]}>
                {item.gifts?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShare(item.id)}
            >
              <LinearGradient
                colors={[web3Colors.gradient3, web3Colors.secondary]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="arrow-redo-outline" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Caption at bottom - TikTok style */}
          <View style={styles.bottomInfo}>
            <View style={styles.captionContainer}>
              <View style={styles.userRow}>
                <View style={styles.creatorAvatar}>
                  <MaterialCommunityIcons name="account" size={20} color={web3Colors.text} />
                </View>
                <Text style={styles.creatorName}>@{item.caption}</Text>
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={16} color={web3Colors.accent} />
                </View>
              </View>
              
              {/* Stats Row */}
              <View style={styles.reelStatsRow}>
                <View style={styles.statChip}>
                  <Ionicons name="heart" size={12} color={web3Colors.accent} />
                  <Text style={styles.statChipText}>{(item.likes?.length || 0) + (likedReels[item.id] ? 1 : 0)}</Text>
                </View>
                <View style={styles.statChip}>
                  <MaterialIcons name="card-giftcard" size={12} color={web3Colors.bonk} />
                  <Text style={styles.statChipText}>{item.gifts?.length || 0} BONK</Text>
                </View>
                <View style={styles.statChip}>
                  <MaterialCommunityIcons name="lightning-bolt" size={12} color={web3Colors.warning} />
                  <Text style={styles.statChipText}>SOL</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[web3Colors.background, '#1A1B3A', web3Colors.background]}
      style={styles.container}
    >
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[web3Colors.gradient1, web3Colors.gradient2]}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="white" />
          </LinearGradient>
          <Text style={styles.loadingText}>Loading BONK-powered Reels...</Text>
        </View>
      ) : reels.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={[web3Colors.cardBg, 'rgba(148, 69, 255, 0.1)']}
            style={styles.emptyCard}
          >
            <Ionicons name="film" size={60} color={web3Colors.primary} />
            <Text style={styles.emptyTitle}>No Reels Yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to create amazing Web3 content!</Text>
          </LinearGradient>
        </View>
      ) : (
        <FlatList
          data={reels}
          renderItem={renderReel}
          keyExtractor={(item, index) => index.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewabilityConfig}
        />
      )}

      {/* Enhanced Floating Action Button - Moved higher to avoid overlap */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <LinearGradient
          colors={[web3Colors.gradient1, web3Colors.gradient2, web3Colors.gradient3]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Comment Modal */}
     <ReelsCommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedReelId(null);
        }}
        reelId={selectedReelId}
        userId={getValidUserId(user, walletInfo)}
        endpoint={enndpoint.main}
      />

      {/* Enhanced Gift Modal */}
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
              {/* Enhanced Balance Display */}
              <View style={styles.giftBalanceCard}>
                <View style={styles.giftBalanceHeader}>
                  <Text style={styles.giftBalanceLabel}>Your BONK Balance</Text>
                  <TouchableOpacity 
                    style={styles.giftRefreshButton}
                    onPress={() => fetchBalance(true)}
                    disabled={balanceLoading}
                  >
                    <Ionicons 
                      name="refresh" 
                      size={16} 
                      color={web3Colors.primary} 
                      style={balanceLoading ? { opacity: 0.5 } : {}}
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.giftBalanceRow}>
                  <MaterialCommunityIcons name="dog" size={24} color={web3Colors.bonk} />
                  <Text style={styles.giftBalanceAmount}>
                    {balanceLoading ? 'Refreshing...' : 
                     userBonkBalance !== null ? `${userBonkBalance.toLocaleString()}` : '0'}
                  </Text>
                </View>
              </View>

              {/* Recipient Info */}
              <View style={styles.giftRecipientCard}>
                <Text style={styles.giftRecipientLabel}>Sending to creator:</Text>
                <Text style={styles.giftRecipientName}>
                  @{selectedReel?.caption || 'Anonymous'}
                </Text>
                <Text style={styles.giftRecipientSubtext}>For their amazing reel! 🔥</Text>
              </View>

              {/* Amount Input */}
              <View style={styles.giftInputContainer}>
                <Text style={styles.giftInputLabel}>BONK Amount</Text>
                <View style={styles.giftAmountInputRow}>
                  <TextInput
                    style={styles.giftAmountInput}
                    value={giftAmount}
                    onChangeText={handleGiftAmountChange}
                    placeholder="0.00"
                    placeholderTextColor={web3Colors.textSecondary}
                    keyboardType="numeric"
                    editable={!balanceLoading}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.giftMaxButton,
                      (!userBonkBalance || userBonkBalance <= 0 || balanceLoading) && { opacity: 0.5 }
                    ]}
                    onPress={setMaxGiftAmount}
                    disabled={!userBonkBalance || userBonkBalance <= 0 || balanceLoading}
                  >
                    <Text style={styles.giftMaxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Quick Amount Buttons */}
                <View style={styles.giftQuickAmountContainer}>
                  {[100, 500, 1000, 5000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.giftQuickAmountButton,
                        (!userBonkBalance || userBonkBalance < amount || balanceLoading) && { opacity: 0.5 }
                      ]}
                      onPress={() => setGiftAmount(amount.toString())}
                      disabled={!userBonkBalance || userBonkBalance < amount || balanceLoading}
                    >
                      <Text style={[
                        styles.giftQuickAmountText,
                        (!userBonkBalance || userBonkBalance < amount || balanceLoading) && { color: web3Colors.textSecondary }
                      ]}>
                        {amount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Balance validation message */}
                {giftAmount && userBonkBalance !== null && parseFloat(giftAmount) > userBonkBalance && (
                  <Text style={styles.giftValidationErrorText}>
                    Insufficient balance. You have {userBonkBalance.toLocaleString()} BONK available.
                  </Text>
                )}
              </View>

              {/* Reel Preview */}
              <View style={styles.giftReelPreviewCard}>
                <Text style={styles.giftPreviewLabel}>Gifting for this reel:</Text>
                <View style={styles.giftMiniReelPreview}>
                  <Text style={styles.giftMiniReelCaption}>@{selectedReel?.caption}</Text>
                  {selectedReel?.pov && (
                    <Text style={styles.giftMiniReelPov}>POV: {selectedReel.pov}</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.giftModalActions}>
              <TouchableOpacity
                style={styles.giftCancelButton}
                onPress={() => {
                  setGiftModalVisible(false);
                  setGiftAmount('');
                  setSelectedReel(null);
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
                   balanceLoading) && styles.giftSendButtonDisabled
                ]}
                onPress={handleSendGift}
                disabled={
                  giftLoading || 
                  !giftAmount || 
                  parseFloat(giftAmount) <= 0 || 
                  !userBonkBalance || 
                  parseFloat(giftAmount) > userBonkBalance ||
                  balanceLoading
                }
              >
                {giftLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={18} color="white" />
                    <Text style={styles.giftSendButtonText}>
                      Send {giftAmount ? parseFloat(giftAmount).toLocaleString() : ''} BONK
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Reel Modal */}
      <Modal animationType="slide" visible={showModal} transparent>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[web3Colors.background, '#1A1B3A']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Web3 Reel</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={web3Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Fixed ScrollView with proper flex and contentContainerStyle */}
            <ScrollView 
              style={styles.createModalBody}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Caption</Text>
                <TextInput
                  placeholder="What's happening in Web3?"
                  placeholderTextColor={web3Colors.textSecondary}
                  style={styles.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>POV (Optional)</Text>
                <TextInput
                  placeholder="Share your perspective..."
                  placeholderTextColor={web3Colors.textSecondary}
                  style={styles.input}
                  value={pov}
                  onChangeText={setPov}
                />
              </View>

              <TouchableOpacity
                style={styles.pickButton}
                onPress={handlePickVideo}
              >
                <LinearGradient
                  colors={[web3Colors.gradient1, web3Colors.gradient2]}
                  style={styles.pickButtonGradient}
                >
                  <Ionicons 
                    name={videoUri ? "videocam" : "add-circle"} 
                    size={20} 
                    color="white" 
                  />
                  <Text style={styles.pickButtonText}>
                    {videoUri ? 'Change Video' : 'Pick Video'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {videoUri && (
                <View style={styles.videoPreview}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <View style={styles.previewContainer}>
                    <Video
                      source={{ uri: videoUri }}
                      style={styles.previewVideo}
                      controls
                      resizeMode="cover"
                    />
                  </View>
                </View>
              )}

              {/* Web3 Features Info */}
              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>🚀 Memelonked Reel Features</Text>
                <Text style={styles.featuresText}>
                  • Earn BONK gifts from viewers{'\n'}
                  • Get likes and comments from the community{'\n'}
                  • Share with Solana ecosystem{'\n'}
                  • Build your Web3 creator profile
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleSubmit}
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
                    {submitting ? 'Launching...' : 'Launch Reel'}
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

export default ReelsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    textAlign: 'center',
  },
  reelContainer: {
    height: height,
    position: 'relative',
    backgroundColor: '#000',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  rightActions: {
    position: 'absolute',
    left: 15,
    bottom: 230, 
    alignItems: 'center',
  },
  actionButton: {
    marginVertical: 15,
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionText: {
    color: web3Colors.text,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: "20%",
    left: "15%",
    right: "25%",
  },
  captionContainer: {
    backgroundColor: web3Colors.glassOverlay,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: web3Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  creatorName: {
    color: web3Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  // POV Badge at top - TikTok style
  povBadgeTop: {
    position: 'absolute',
    top: 100,
    // left: "40%",
    zIndex: 10,

  },
  povBadgeTopGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 12,
    // paddingVertical: 6,
    padding: 20,
    borderRadius: 20,
    gap: 4,
  },
  povTextTop: {
    color: 'white',
    fontSize: 30,
    fontWeight: '600',
  },
  reelStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statChipText: {
    color: web3Colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 150, // Moved higher to avoid overlap with share button
    right: 20,
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: web3Colors.darkOverlay,
    padding: 20,
  },
  
  // Gift Modal Styles
  giftModalContent: {
    backgroundColor: web3Colors.cardBg,
    borderRadius: 20,
    height: '85%', // Fixed height instead of maxHeight
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  giftModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
  },
  giftModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  inputContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 8,
  },

  previewLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 8,
  },
  
  // Create Modal Styles
  modalContent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    elevation: 10,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: '90%', // Ensure modal doesn't exceed screen
    minHeight: 400, // Minimum height to ensure content is visible
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: web3Colors.border,
  },
  
  createModalBody: {
    flex: 1, // This is crucial - gives the ScrollView flex space
    paddingHorizontal: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: web3Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: web3Colors.glassOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
   input: {
    backgroundColor: web3Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: web3Colors.text,
    borderWidth: 1,
    borderColor: web3Colors.border,
    minHeight: 50, // Ensure minimum height
  },

   inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: web3Colors.text,
    marginBottom: 8,
  },
  
   scrollViewContent: {
    paddingVertical: 10,
    paddingBottom: 20, // Extra padding at bottom
  },
  
  inputContainer: {
    marginBottom: 20,
  },

 captionInput: {
    backgroundColor: web3Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: web3Colors.text,
    borderWidth: 1,
    borderColor: web3Colors.border,
    textAlignVertical: 'top',
    minHeight: 80,
  },

  pickButton: {
    marginBottom: 20,
  },
  pickButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  pickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  videoPreview: {
    marginBottom: 24,
  },
  previewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  previewVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  featuresCard: {
    backgroundColor: web3Colors.background,
    marginBottom: 16,
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
   modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: web3Colors.border,
    gap: 12,
  },
  
  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

    balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  refreshButton: {
    padding: 4,
  },
  
  balanceTimestamp: {
    fontSize: 10,
    color: web3Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  balanceError: {
    fontSize: 10,
    color: web3Colors.accent,
    marginTop: 4,
  },

    balanceCheckButton: {
    marginVertical: 8,
  },
  
  balanceCheckGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  
  balanceCheckText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  maxButtonDisabled: {
    opacity: 0.5,
    backgroundColor: web3Colors.border,
  },
  maxButtonTextDisabled: {
    opacity: 0.5,
  },
  quickAmountButtonDisabled: {
    opacity: 0.5,
    backgroundColor: web3Colors.border,
  },
  validationError: {
    color: web3Colors.accent,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  usdEquivalent: {
    color: web3Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  transactionInfoCard: {
    backgroundColor: web3Colors.background,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  transactionInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
  },
  transactionValue: {
    fontSize: 12,
    color: web3Colors.text,
    fontWeight: '500',
  },
  giftModalBodyFixed: {
    flex: 1,
    paddingVertical: 10,
  },

  validationErrorText: {
    color: web3Colors.accent,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Gift Modal Balance Card
  giftBalanceCard: {
    backgroundColor: web3Colors.background,
    margin: 16,
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 8,
  },

  giftBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  giftBalanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.bonk,
  },

  giftRefreshButton: {
    padding: 4,
  },

  // Gift Modal Recipient Card
  giftRecipientCard: {
    backgroundColor: web3Colors.background,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },

  giftRecipientLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 4,
  },

  giftRecipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 4,
  },

  giftRecipientSubtext: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    fontStyle: 'italic',
  },

  // Gift Modal Input Section
  giftInputContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  giftInputLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 8,
  },

  giftAmountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  giftAmountInput: {
    flex: 1,
    backgroundColor: web3Colors.background,
    borderWidth: 1,
    borderColor: web3Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: web3Colors.text,
    fontWeight: 'bold',
  },

  giftMaxButton: {
    backgroundColor: web3Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },

  giftMaxButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },

  giftQuickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },

  giftQuickAmountButton: {
    flex: 1,
    backgroundColor: web3Colors.border,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  giftQuickAmountText: {
    fontSize: 12,
    color: web3Colors.text,
    fontWeight: '600',
  },

  // Gift Modal Reel Preview
  giftReelPreviewCard: {
    backgroundColor: web3Colors.background,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },

  giftPreviewLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 8,
  },

  giftMiniReelPreview: {
    backgroundColor: web3Colors.cardBg,
    padding: 12,
    borderRadius: 8,
  },

  giftMiniReelCaption: {
    fontSize: 14,
    color: web3Colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  giftMiniReelPov: {
    fontSize: 12,
    color: web3Colors.textSecondary,
  },

  // Gift Modal Actions
  giftModalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: web3Colors.border,
  },

  giftCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
    alignItems: 'center',
  },

  giftCancelButtonText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    fontWeight: '600',
  },

  giftSendButton: {
    flex: 2,
    backgroundColor: web3Colors.bonk,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  giftSendButtonDisabled: {
    backgroundColor: web3Colors.border,
  },

  giftSendButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },

  // Validation and Error Messages
  giftValidationErrorText: {
    color: web3Colors.accent,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});