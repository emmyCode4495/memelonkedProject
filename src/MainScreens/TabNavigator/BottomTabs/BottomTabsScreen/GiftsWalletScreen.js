
// import { 
//   FlatList, 
//   Image, 
//   ScrollView, 
//   StyleSheet, 
//   Text, 
//   View, 
//   TouchableOpacity,
//   Dimensions,
//   ActivityIndicator,
//   Alert
// } from 'react-native';
// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// import colors from '../../../../../constants/colors';
// import { tokensData } from '../../../../../constants/data/data';
// import { AuthContext } from '../../../../persistence/AuthContext';

// const { width } = Dimensions.get('window');

// // --- Configuration for BONK ---
// const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
// const SOLANA_NETWORK = 'mainnet-beta';

// // Web3 Color Palette
// const web3Colors = {
//   primary: '#00D4FF',
//   secondary: '#9945FF',
//   accent: '#14F195',
//   background: '#0D0E1A',
//   cardBg: '#1A1B2E',
//   border: '#2A2B3E',
//   text: '#FFFFFF',
//   textSecondary: '#A0A3BD',
//   gradient1: '#9945FF',
//   gradient2: '#00D4FF',
//   bonk: '#FF6B35',
//   success: '#14F195',
//   warning: '#FFB800',
//   error: '#FF4757',
// };

// /**
//  * A hook to fetch the BONK balance of a given Solana wallet address.
//  * This is a reusable piece of logic for fetching the balance.
//  * @param {PublicKey | null} publicKey - The public key of the wallet.
//  * @returns {{ balance: number | null, loading: boolean, error: Error | null, fetchBalance: () => void }}
//  */
// const useBonkBalance = (publicKey) => {
//     const [balance, setBalance] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const fetchBalance = useCallback(async () => {
//         if (!publicKey) {
//             setBalance(null);
//             return;
//         }

//         setLoading(true);
//         setError(null);
        
//         console.log(`[useBonkBalance] Fetching BONK balance for wallet: ${publicKey.toBase58()}`);

//         try {
//             // Use mainnet-beta connection
//             const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');
            
//             console.log(`[useBonkBalance] Using BONK mint address: ${BONK_MINT_ADDRESS}`);

//             const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
//                 mint: new PublicKey(BONK_MINT_ADDRESS),
//             });

//             console.log('[useBonkBalance] Full RPC Response:', JSON.stringify(accounts, null, 2));

//             if (accounts.value.length > 0) {
//                 console.log('[useBonkBalance] Found token account(s).');
//                 const accountInfo = accounts.value[0].account.data.parsed.info;
//                 const tokenBalance = accountInfo.tokenAmount.uiAmount || 0;
//                 console.log(`[useBonkBalance] Token balance found: ${tokenBalance}`);
//                 setBalance(tokenBalance);
//             } else {
//                 console.log('[useBonkBalance] No BONK token account found for this wallet. Setting balance to 0.');
//                 setBalance(0);
//             }
//         } catch (err) {
//             console.error("[useBonkBalance] An error occurred:", err);
//             setError(err instanceof Error ? err : new Error('An unknown error occurred'));
//             setBalance(0);
//         } finally {
//             setLoading(false);
//         }
//     }, [publicKey]);

//     useEffect(() => {
//         fetchBalance();
//     }, [fetchBalance]);

//     return { balance, loading, error, fetchBalance };
// };

// const GiftsWalletScreen = () => {
//   const { user, walletInfo } = useContext(AuthContext);
//   const [userPublicKey, setUserPublicKey] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [bonkPriceUSD, setBonkPriceUSD] = useState(0.000025); // Mock price, replace with real API

//   // Get BONK balance using the custom hook
//   const { balance, loading, error, fetchBalance } = useBonkBalance(userPublicKey);

//   // Convert wallet address to PublicKey on component mount
//   useEffect(() => {
//     if (user?.walletAddress) {
//       try {
//         const publicKey = new PublicKey(user.walletAddress);
//         setUserPublicKey(publicKey);
//         console.log('Public key set for BONK balance fetch:', publicKey.toBase58());
//       } catch (error) {
//         console.error('Error converting wallet address to PublicKey:', error);
//         Alert.alert('Error', 'Invalid wallet address format');
//       }
//     } else if (walletInfo?.address) {
//       try {
//         let publicKey;
//         let cleanAddress = walletInfo.address.trim();
        
//         // Handle different address formats (same logic as your WalletConnectScreen)
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
//         console.log('Public key set from wallet info:', publicKey.toBase58());
//       } catch (error) {
//         console.error('Error converting wallet info address to PublicKey:', error);
//       }
//     }
//   }, [user, walletInfo]);

//   // Auto-refresh balance every 30 seconds
//   useEffect(() => {
//     if (userPublicKey) {
//       const interval = setInterval(() => {
//         fetchBalance();
//         setLastUpdated(new Date());
//       }, 30000);
      
//       return () => clearInterval(interval);
//     }
//   }, [userPublicKey, fetchBalance]);

//   // Update last updated time when balance changes
//   useEffect(() => {
//     if (balance !== null) {
//       setLastUpdated(new Date());
//     }
//   }, [balance]);

//   // Format number with commas
//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(num);
//   };

//   // Format BONK balance (large numbers)
//   const formatBonkBalance = (balance) => {
//     if (balance >= 1000000) {
//       return (balance / 1000000).toFixed(2) + 'M';
//     } else if (balance >= 1000) {
//       return (balance / 1000).toFixed(2) + 'K';
//     }
//     return balance?.toFixed(2) || '0.00';
//   };

//   // Calculate USD value
//   const calculateUSDValue = () => {
//     if (balance && bonkPriceUSD) {
//       return balance * bonkPriceUSD;
//     }
//     return 0;
//   };

//   const handleRefreshBalance = () => {
//     if (userPublicKey) {
//       fetchBalance();
//     } else {
//       Alert.alert('Error', 'No wallet connected');
//     }
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity style={styles.card} activeOpacity={0.8}>
//       <View style={styles.tokenImageContainer}>
//         <LinearGradient
//           colors={[web3Colors.gradient1, web3Colors.gradient2]}
//           style={styles.tokenImageGradient}
//         >
//           <Image source={{ uri: item.image }} style={styles.tokenImage} />
//         </LinearGradient>
//       </View>
      
//       <View style={styles.details}>
//         <View style={styles.headerRow}>
//           <Text style={styles.tokenSymbol}>{item.tokenSymbol}</Text>
//           <Text style={styles.tokenValue}>{item.valuePerToken}</Text>
//         </View>
//         <Text style={styles.totalValue}>{item.totalValue}</Text>
//         <View style={styles.tokenInfoRow}>
//           <Text style={styles.tokenName}>{item.tokenFullName}</Text>
//           <View style={styles.chainBadge}>
//             <MaterialCommunityIcons name="lightning-bolt" size={10} color={web3Colors.accent} />
//             <Text style={styles.chainText}>SOL</Text>
//           </View>
//         </View>
//       </View>
      
//       <TouchableOpacity style={styles.moreButton}>
//         <Ionicons name="chevron-forward" size={16} color={web3Colors.textSecondary} />
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <LinearGradient
//           colors={[web3Colors.gradient1, web3Colors.gradient2]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.headerGradient}
//         >
//           <TouchableOpacity style={styles.backButton}>
//             <Ionicons name="chevron-back" size={24} color={web3Colors.text} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>BONK Gifts Wallet</Text>
//           <View style={styles.headerRight}>
//             <TouchableOpacity style={styles.headerIcon} onPress={handleRefreshBalance}>
//               {loading ? (
//                 <ActivityIndicator size="small" color={web3Colors.text} />
//               ) : (
//                 <MaterialIcons name="refresh" size={24} color={web3Colors.text} />
//               )}
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>
//       </View>

//       <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
//         {/* BONK Balance Card */}
//         <View style={styles.balanceCard}>
//           <LinearGradient
//             colors={[web3Colors.cardBg, web3Colors.border]}
//             style={styles.balanceGradient}
//           >
//             {/* BONK Logo with Glow Effect */}
//             <View style={styles.giftBoxContainer}>
//               <View style={[styles.giftBoxGlow, { backgroundColor: 'rgba(255, 107, 53, 0.2)' }]}>
//                 <MaterialCommunityIcons 
//                   name="dog" 
//                   size={60} 
//                   color={web3Colors.bonk}
//                 />
//               </View>
//             </View>

//             {/* Real-time Balance Info */}
//             <View style={styles.balanceInfo}>
//               <View style={styles.balanceHeader}>
//                 <Text style={styles.balanceLabel}>BONK Balance</Text>
//                 {lastUpdated && (
//                   <Text style={styles.lastUpdated}>
//                     Updated: {lastUpdated.toLocaleTimeString()}
//                   </Text>
//                 )}
//               </View>
              
//               {!userPublicKey ? (
//                 <View style={styles.noWalletContainer}>
//                   <MaterialIcons name="account-balance-wallet" size={48} color={web3Colors.textSecondary} />
//                   <Text style={styles.noWalletText}>No wallet connected</Text>
//                   <Text style={styles.noWalletSubtext}>Connect your wallet to view BONK balance</Text>
//                 </View>
//               ) : loading ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color={web3Colors.bonk} />
//                   <Text style={styles.loadingText}>Fetching balance...</Text>
//                 </View>
//               ) : error ? (
//                 <View style={styles.errorContainer}>
//                   <MaterialIcons name="error-outline" size={48} color={web3Colors.error} />
//                   <Text style={styles.errorText}>Could not fetch balance</Text>
//                   <TouchableOpacity onPress={handleRefreshBalance} style={styles.retryButton}>
//                     <Text style={styles.retryText}>Retry</Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 <>
//                   <Text style={styles.bonkAmount}>
//                     {balance !== null ? balance.toLocaleString() : '0'} BONK
//                   </Text>
//                   <Text style={styles.balanceAmount}>
//                     ${formatNumber(calculateUSDValue())}
//                   </Text>
                  
//                   <View style={styles.walletAddressContainer}>
//                     <Text style={styles.walletAddressLabel}>Wallet:</Text>
//                     <Text style={styles.walletAddress}>
//                       {userPublicKey.toBase58().slice(0, 4)}...{userPublicKey.toBase58().slice(-4)}
//                     </Text>
//                   </View>
//                 </>
//               )}
//             </View>
//           </LinearGradient>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.actionsContainer}>
//           <TouchableOpacity 
//             style={[styles.actionButton, !userPublicKey && styles.disabledButton]} 
//             activeOpacity={0.8}
//             disabled={!userPublicKey}
//           >
//             <LinearGradient
//               colors={!userPublicKey ? ['#666', '#888'] : [web3Colors.gradient1, web3Colors.gradient2]}
//               style={styles.actionButtonGradient}
//             >
//               <MaterialCommunityIcons name="wallet-plus" size={24} color={web3Colors.text} />
//             </LinearGradient>
//             <Text style={styles.actionButtonText}>Receive</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.actionButton, !userPublicKey && styles.disabledButton]} 
//             activeOpacity={0.8}
//             disabled={!userPublicKey}
//           >
//             <LinearGradient
//               colors={!userPublicKey ? ['#666', '#888'] : [web3Colors.bonk, '#FF8C42']}
//               style={styles.actionButtonGradient}
//             >
//               <MaterialCommunityIcons name="send" size={24} color={web3Colors.text} />
//             </LinearGradient>
//             <Text style={styles.actionButtonText}>Send BONK</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.actionButton, !userPublicKey && styles.disabledButton]} 
//             activeOpacity={0.8}
//             disabled={!userPublicKey}
//           >
//             <LinearGradient
//               colors={!userPublicKey ? ['#666', '#888'] : [web3Colors.accent, '#0FD178']}
//               style={styles.actionButtonGradient}
//             >
//               <MaterialCommunityIcons name="swap-horizontal" size={24} color={web3Colors.text} />
//             </LinearGradient>
//             <Text style={styles.actionButtonText}>Swap</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tokens List */}
//         <View style={styles.tokensSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Gift Tokens</Text>
//             <TouchableOpacity style={styles.seeAllButton}>
//               <Text style={styles.seeAllText}>See All</Text>
//               <Ionicons name="chevron-forward" size={16} color={web3Colors.primary} />
//             </TouchableOpacity>
//           </View>

//           <FlatList
//             data={tokensData}
//             keyExtractor={(item) => item.id.toString()}
//             renderItem={renderItem}
//             scrollEnabled={false}
//             contentContainerStyle={styles.tokensList}
//             ItemSeparatorComponent={() => <View style={styles.tokenSeparator} />}
//           />
//         </View>

//         {/* BONK Stats Cards */}
//         <View style={styles.statsContainer}>
//           <View style={styles.statCard}>
//             <LinearGradient
//               colors={[web3Colors.cardBg, web3Colors.border]}
//               style={styles.statGradient}
//             >
//               <MaterialIcons name="card-giftcard" size={32} color={web3Colors.bonk} />
//               <Text style={styles.statNumber}>
//                 {balance ? formatBonkBalance(balance * 0.2) : '0'}
//               </Text>
//               <Text style={styles.statLabel}>BONK Gifts Received</Text>
//             </LinearGradient>
//           </View>

//           <View style={styles.statCard}>
//             <LinearGradient
//               colors={[web3Colors.cardBg, web3Colors.border]}
//               style={styles.statGradient}
//             >
//               <MaterialCommunityIcons name="send" size={32} color={web3Colors.accent} />
//               <Text style={styles.statNumber}>
//                 {balance ? formatBonkBalance(balance * 0.07) : '0'}
//               </Text>
//               <Text style={styles.statLabel}>BONK Gifts Sent</Text>
//             </LinearGradient>
//           </View>
//         </View>

//         {/* Bottom Padding */}
//         <View style={styles.bottomPadding} />
//       </ScrollView>
//     </View>
//   );
// };

// export default GiftsWalletScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: web3Colors.background,
//   },
//   header: {
//     paddingTop: 50,
//   },
//   headerGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerRight: {
//     width: 40,
//     alignItems: 'flex-end',
//   },
//   headerIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   balanceCard: {
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 20,
//     overflow: 'hidden',
//     elevation: 8,
//     shadowColor: web3Colors.bonk,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   balanceGradient: {
//     padding: 24,
//     alignItems: 'center',
//     minHeight: 200,
//   },
//   giftBoxContainer: {
//     marginBottom: 20,
//   },
//   giftBoxGlow: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 10,
//     shadowColor: web3Colors.bonk,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//   },
//   balanceInfo: {
//     alignItems: 'center',
//     width: '100%',
//     flex: 1,
//     justifyContent: 'center',
//   },
//   balanceHeader: {
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   balanceLabel: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     fontWeight: '500',
//   },
//   lastUpdated: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//     marginTop: 4,
//     opacity: 0.7,
//   },
//   bonkAmount: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: web3Colors.bonk,
//     marginBottom: 8,
//   },
//   balanceAmount: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginBottom: 16,
//   },
//   walletAddressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   walletAddressLabel: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//     marginRight: 6,
//   },
//   walletAddress: {
//     fontSize: 12,
//     color: web3Colors.text,
//     fontFamily: 'monospace',
//   },
//   noWalletContainer: {
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'center',
//   },
//   noWalletText: {
//     fontSize: 18,
//     color: web3Colors.textSecondary,
//     marginTop: 12,
//     fontWeight: '600',
//   },
//   noWalletSubtext: {
//     fontSize: 14,
//     color: web3Colors.textSecondary,
//     marginTop: 4,
//     textAlign: 'center',
//     opacity: 0.8,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'center',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     marginTop: 12,
//   },
//   errorContainer: {
//     alignItems: 'center',
//     flex: 1,
//     justifyContent: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//     color: web3Colors.error,
//     marginTop: 12,
//     marginBottom: 16,
//   },
//   retryButton: {
//     backgroundColor: web3Colors.bonk,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 20,
//   },
//   retryText: {
//     color: web3Colors.text,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   actionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginHorizontal: 20,
//     marginTop: 24,
//   },
//   actionButton: {
//     alignItems: 'center',
//     flex: 1,
//     marginHorizontal: 8,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   actionButtonGradient: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//   },
//   actionButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: web3Colors.text,
//   },
//   tokensSection: {
//     marginTop: 32,
//     marginHorizontal: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//   },
//   seeAllButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   seeAllText: {
//     fontSize: 14,
//     color: web3Colors.primary,
//     marginRight: 4,
//     fontWeight: '500',
//   },
//   tokensList: {
//     paddingBottom: 16,
//   },
//   card: {
//     backgroundColor: web3Colors.cardBg,
//     borderRadius: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   tokenImageContainer: {
//     marginRight: 16,
//   },
//   tokenImageGradient: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tokenImage: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//   },
//   details: {
//     flex: 1,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   tokenSymbol: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//   },
//   tokenValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: web3Colors.success,
//   },
//   totalValue: {
//     fontSize: 14,
//     color: web3Colors.textSecondary,
//     marginBottom: 6,
//   },
//   tokenInfoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   tokenName: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//     flex: 1,
//   },
//   chainBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: web3Colors.border,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   chainText: {
//     fontSize: 10,
//     color: web3Colors.accent,
//     marginLeft: 2,
//     fontWeight: '600',
//   },
//   moreButton: {
//     padding: 8,
//   },
//   tokenSeparator: {
//     height: 12,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginHorizontal: 20,
//     marginTop: 24,
//   },
//   statCard: {
//     flex: 1,
//     marginHorizontal: 6,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   statGradient: {
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//     textAlign: 'center',
//   },
//   bottomPadding: {
//     height: 40,
//   },
// });

import { 
  FlatList, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import colors from '../../../../../constants/colors';
import { AuthContext } from '../../../../persistence/AuthContext';

const { width } = Dimensions.get('window');

// --- Configuration for BONK ---
const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
const SOLANA_NETWORK = 'mainnet-beta';
const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

// Web3 Color Palette
const web3Colors = {
  primary: '#00D4FF',
  secondary: '#9945FF',
  accent: '#14F195',
  background: '#0D0E1A',
  cardBg: '#1A1B2E',
  border: '#2A2B3E',
  text: '#FFFFFF',
  textSecondary: '#A0A3BD',
  gradient1: '#9945FF',
  gradient2: '#00D4FF',
  bonk: '#FF6B35',
  success: '#14F195',
  warning: '#FFB800',
  error: '#FF4757',
};

/**
 * Hook to fetch token metadata from Jupiter API
 */
const useTokenMetadata = () => {
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [metadataLoading, setMetadataLoading] = useState(false);

  const fetchTokenMetadata = useCallback(async (mintAddresses) => {
    if (!mintAddresses || mintAddresses.length === 0) return;

    setMetadataLoading(true);
    try {
      // Fetch token list from Jupiter API
      const response = await fetch('https://token.jup.ag/all');
      const tokenList = await response.json();
      
      const metadata = {};
      mintAddresses.forEach(mint => {
        const token = tokenList.find(t => t.address === mint);
        if (token) {
          metadata[mint] = {
            symbol: token.symbol,
            name: token.name,
            logoURI: token.logoURI,
            decimals: token.decimals,
          };
        }
      });
      
      setTokenMetadata(prev => ({ ...prev, ...metadata }));
    } catch (error) {
      console.error('Error fetching token metadata:', error);
    } finally {
      setMetadataLoading(false);
    }
  }, []);

  return { tokenMetadata, metadataLoading, fetchTokenMetadata };
};

/**
 * Hook to fetch token prices from Jupiter API
 */
const useTokenPrices = () => {
  const [tokenPrices, setTokenPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);

  const fetchTokenPrices = useCallback(async (mintAddresses) => {
    if (!mintAddresses || mintAddresses.length === 0) return;

    setPricesLoading(true);
    try {
      const addresses = mintAddresses.join(',');
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${addresses}`);
      const priceData = await response.json();
      
      const prices = {};
      Object.keys(priceData.data || {}).forEach(mint => {
        prices[mint] = priceData.data[mint].price;
      });
      
      setTokenPrices(prev => ({ ...prev, ...prices }));
    } catch (error) {
      console.error('Error fetching token prices:', error);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  return { tokenPrices, pricesLoading, fetchTokenPrices };
};

/**
 * Hook to fetch all tokens in wallet
 */
const useWalletTokens = (publicKey) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { tokenMetadata, fetchTokenMetadata } = useTokenMetadata();
  const { tokenPrices, fetchTokenPrices } = useTokenPrices();

  const fetchTokens = useCallback(async () => {
    if (!publicKey) {
      setTokens([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');
      
      // Get all token accounts for the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      console.log(`[useWalletTokens] Found ${tokenAccounts.value.length} token accounts`);

      // Filter out empty accounts and format data
      const validTokens = tokenAccounts.value
        .map(account => {
          const accountInfo = account.account.data.parsed.info;
          const balance = accountInfo.tokenAmount.uiAmount;
          
          if (balance > 0) {
            return {
              mint: accountInfo.mint,
              balance: balance,
              decimals: accountInfo.tokenAmount.decimals,
            };
          }
          return null;
        })
        .filter(Boolean);

      console.log(`[useWalletTokens] Found ${validTokens.length} tokens with balance`);

      if (validTokens.length > 0) {
        const mintAddresses = validTokens.map(token => token.mint);
        
        // Fetch metadata and prices for all tokens
        await Promise.all([
          fetchTokenMetadata(mintAddresses),
          fetchTokenPrices(mintAddresses)
        ]);
      }

      setTokens(validTokens);
    } catch (err) {
      console.error("[useWalletTokens] Error fetching tokens:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tokens'));
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [publicKey, fetchTokenMetadata, fetchTokenPrices]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Combine token data with metadata and prices
  const enrichedTokens = tokens.map(token => {
    const metadata = tokenMetadata[token.mint];
    const price = tokenPrices[token.mint] || 0;
    const totalValue = token.balance * price;

    return {
      id: token.mint,
      mint: token.mint,
      balance: token.balance,
      tokenSymbol: metadata?.symbol || 'UNKNOWN',
      tokenFullName: metadata?.name || 'Unknown Token',
      image: metadata?.logoURI || 'https://via.placeholder.com/40',
      valuePerToken: `$${price.toFixed(6)}`,
      totalValue: `$${totalValue.toFixed(2)}`,
      price: price,
      usdValue: totalValue,
    };
  });

  return { 
    tokens: enrichedTokens, 
    loading, 
    error, 
    fetchTokens,
    tokenMetadata,
    tokenPrices
  };
};

/**
 * A hook to fetch the BONK balance of a given Solana wallet address.
 */
const useBonkBalance = (publicKey) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log(`[useBonkBalance] Fetching BONK balance for wallet: ${publicKey.toBase58()}`);

    try {
      const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');
      
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(BONK_MINT_ADDRESS),
      });

      if (accounts.value.length > 0) {
        const accountInfo = accounts.value[0].account.data.parsed.info;
        const tokenBalance = accountInfo.tokenAmount.uiAmount || 0;
        console.log(`[useBonkBalance] Token balance found: ${tokenBalance}`);
        setBalance(tokenBalance);
      } else {
        console.log('[useBonkBalance] No BONK token account found. Setting balance to 0.');
        setBalance(0);
      }
    } catch (err) {
      console.error("[useBonkBalance] Error occurred:", err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, fetchBalance };
};

const GiftsWalletScreen = () => {
  const { user, walletInfo } = useContext(AuthContext);
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bonkPriceUSD, setBonkPriceUSD] = useState(0.000025);
  const [refreshing, setRefreshing] = useState(false);
  const [nextAutoRefresh, setNextAutoRefresh] = useState(null);
  
  // Refs for intervals
  const autoRefreshInterval = useRef(null);
  const countdownInterval = useRef(null);

  // Get BONK balance using the custom hook
  const { balance, loading, error, fetchBalance } = useBonkBalance(userPublicKey);
  
  // Get all wallet tokens
  const { 
    tokens, 
    loading: tokensLoading, 
    error: tokensError, 
    fetchTokens,
    tokenPrices 
  } = useWalletTokens(userPublicKey);

  // Convert wallet address to PublicKey on component mount
  useEffect(() => {
    if (user?.walletAddress) {
      try {
        const publicKey = new PublicKey(user.walletAddress);
        setUserPublicKey(publicKey);
        console.log('Public key set for BONK balance fetch:', publicKey.toBase58());
      } catch (error) {
        console.error('Error converting wallet address to PublicKey:', error);
        Alert.alert('Error', 'Invalid wallet address format');
      }
    } else if (walletInfo?.address) {
      try {
        let publicKey;
        let cleanAddress = walletInfo.address.trim();
        
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
        console.log('Public key set from wallet info:', publicKey.toBase58());
      } catch (error) {
        console.error('Error converting wallet info address to PublicKey:', error);
      }
    }
  }, [user, walletInfo]);

  // Fetch BONK price from Jupiter API
  useEffect(() => {
    const fetchBonkPrice = async () => {
      try {
        const response = await fetch(`https://price.jup.ag/v4/price?ids=${BONK_MINT_ADDRESS}`);
        const priceData = await response.json();
        if (priceData.data && priceData.data[BONK_MINT_ADDRESS]) {
          setBonkPriceUSD(priceData.data[BONK_MINT_ADDRESS].price);
        }
      } catch (error) {
        console.error('Error fetching BONK price:', error);
      }
    };

    fetchBonkPrice();
  }, []);

  // Auto-refresh functionality - 30 minutes
  useEffect(() => {
    if (userPublicKey) {
      const startAutoRefresh = () => {
        const nextRefreshTime = new Date(Date.now() + AUTO_REFRESH_INTERVAL);
        setNextAutoRefresh(nextRefreshTime);

        // Clear existing intervals
        if (autoRefreshInterval.current) {
          clearInterval(autoRefreshInterval.current);
        }
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }

        // Set up auto-refresh
        autoRefreshInterval.current = setInterval(() => {
          console.log('[AutoRefresh] Refreshing wallet data...');
          fetchBalance();
          fetchTokens();
          setLastUpdated(new Date());
          
          // Schedule next refresh
          const nextTime = new Date(Date.now() + AUTO_REFRESH_INTERVAL);
          setNextAutoRefresh(nextTime);
        }, AUTO_REFRESH_INTERVAL);

        // Update countdown every minute
        countdownInterval.current = setInterval(() => {
          setNextAutoRefresh(prev => prev); // Trigger re-render for countdown
        }, 60000);
      };

      startAutoRefresh();

      return () => {
        if (autoRefreshInterval.current) {
          clearInterval(autoRefreshInterval.current);
        }
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }
      };
    }
  }, [userPublicKey, fetchBalance, fetchTokens]);

  // Update last updated time when balance changes
  useEffect(() => {
    if (balance !== null) {
      setLastUpdated(new Date());
    }
  }, [balance]);

  // Calculate countdown to next auto-refresh
  const getCountdownText = () => {
    if (!nextAutoRefresh) return '';
    
    const now = new Date();
    const timeDiff = nextAutoRefresh - now;
    
    if (timeDiff <= 0) return 'Refreshing soon...';
    
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `Next refresh: ${hours}h ${remainingMinutes}m`;
    } else {
      return `Next refresh: ${remainingMinutes}m`;
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Format BONK balance (large numbers)
  const formatBonkBalance = (balance) => {
    if (balance >= 1000000) {
      return (balance / 1000000).toFixed(2) + 'M';
    } else if (balance >= 1000) {
      return (balance / 1000).toFixed(2) + 'K';
    }
    return balance?.toFixed(2) || '0.00';
  };

  // Calculate USD value
  const calculateUSDValue = () => {
    if (balance && bonkPriceUSD) {
      return balance * bonkPriceUSD;
    }
    return 0;
  };

  const handleRefreshBalance = async () => {
    if (userPublicKey) {
      setRefreshing(true);
      try {
        await Promise.all([
          fetchBalance(),
          fetchTokens()
        ]);
        setLastUpdated(new Date());
        
        // Reset auto-refresh timer
        const nextRefreshTime = new Date(Date.now() + AUTO_REFRESH_INTERVAL);
        setNextAutoRefresh(nextRefreshTime);
        
        Alert.alert('Success', 'Wallet data refreshed successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to refresh wallet data');
      } finally {
        setRefreshing(false);
      }
    } else {
      Alert.alert('Error', 'No wallet connected');
    }
  };

  const onRefresh = useCallback(async () => {
    await handleRefreshBalance();
  }, [handleRefreshBalance]);

  const renderTokenItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.tokenImageContainer}>
        <LinearGradient
          colors={[web3Colors.gradient1, web3Colors.gradient2]}
          style={styles.tokenImageGradient}
        >
          <Image 
            source={{ uri: item.image }} 
            style={styles.tokenImage}
            onError={() => {
              // Fallback to a default image if token image fails to load
              console.log(`Failed to load image for ${item.tokenSymbol}`);
            }}
          />
        </LinearGradient>
      </View>
      
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.tokenSymbol}>{item.tokenSymbol}</Text>
          <Text style={styles.tokenValue}>{item.valuePerToken}</Text>
        </View>
        <Text style={styles.tokenBalance}>{item.balance.toLocaleString()} {item.tokenSymbol}</Text>
        <Text style={styles.totalValue}>{item.totalValue}</Text>
        <View style={styles.tokenInfoRow}>
          <Text style={styles.tokenName}>{item.tokenFullName}</Text>
          <View style={styles.chainBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={10} color={web3Colors.accent} />
            <Text style={styles.chainText}>SOL</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="chevron-forward" size={16} color={web3Colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[web3Colors.gradient1, web3Colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={web3Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BONK Gifts Wallet</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleRefreshBalance}>
              {loading || refreshing ? (
                <ActivityIndicator size="small" color={web3Colors.text} />
              ) : (
                <MaterialIcons name="refresh" size={24} color={web3Colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[web3Colors.bonk]}
            tintColor={web3Colors.bonk}
          />
        }
      >
        {/* Auto-refresh Status */}
        {nextAutoRefresh && (
          <View style={styles.autoRefreshStatus}>
            <MaterialIcons name="schedule" size={16} color={web3Colors.textSecondary} />
            <Text style={styles.autoRefreshText}>{getCountdownText()}</Text>
          </View>
        )}

        {/* BONK Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[web3Colors.cardBg, web3Colors.border]}
            style={styles.balanceGradient}
          >
            {/* BONK Logo with Glow Effect */}
            <View style={styles.giftBoxContainer}>
              <View style={[styles.giftBoxGlow, { backgroundColor: 'rgba(255, 107, 53, 0.2)' }]}>
                <MaterialCommunityIcons 
                  name="dog" 
                  size={60} 
                  color={web3Colors.bonk}
                />
              </View>
            </View>

            {/* Real-time Balance Info */}
            <View style={styles.balanceInfo}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>BONK Balance</Text>
                {lastUpdated && (
                  <Text style={styles.lastUpdated}>
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </Text>
                )}
              </View>
              
              {!userPublicKey ? (
                <View style={styles.noWalletContainer}>
                  <MaterialIcons name="account-balance-wallet" size={48} color={web3Colors.textSecondary} />
                  <Text style={styles.noWalletText}>No wallet connected</Text>
                  <Text style={styles.noWalletSubtext}>Connect your wallet to view BONK balance</Text>
                </View>
              ) : loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={web3Colors.bonk} />
                  <Text style={styles.loadingText}>Fetching balance...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={48} color={web3Colors.error} />
                  <Text style={styles.errorText}>Could not fetch balance</Text>
                  <TouchableOpacity onPress={handleRefreshBalance} style={styles.retryButton}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.bonkAmount}>
                    {balance !== null ? balance.toLocaleString() : '0'} BONK
                  </Text>
                  <Text style={styles.balanceAmount}>
                    ${formatNumber(calculateUSDValue())}
                  </Text>
                  
                  <View style={styles.walletAddressContainer}>
                    <Text style={styles.walletAddressLabel}>Wallet:</Text>
                    <Text style={styles.walletAddress}>
                      {userPublicKey.toBase58().slice(0, 4)}...{userPublicKey.toBase58().slice(-4)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, !userPublicKey && styles.disabledButton]} 
            activeOpacity={0.8}
            disabled={!userPublicKey}
          >
            <LinearGradient
              colors={!userPublicKey ? ['#666', '#888'] : [web3Colors.gradient1, web3Colors.gradient2]}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons name="wallet-plus" size={24} color={web3Colors.text} />
            </LinearGradient>
            <Text style={styles.actionButtonText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, !userPublicKey && styles.disabledButton]} 
            activeOpacity={0.8}
            disabled={!userPublicKey}
          >
            <LinearGradient
              colors={!userPublicKey ? ['#666', '#888'] : [web3Colors.bonk, '#FF8C42']}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons name="send" size={24} color={web3Colors.text} />
            </LinearGradient>
            <Text style={styles.actionButtonText}>Send BONK</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, !userPublicKey && styles.disabledButton]} 
            activeOpacity={0.8}
            disabled={!userPublicKey}
          >
            <LinearGradient
              colors={!userPublicKey ? ['#666', '#888'] : [web3Colors.accent, '#0FD178']}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={24} color={web3Colors.text} />
            </LinearGradient>
            <Text style={styles.actionButtonText}>Swap</Text>
          </TouchableOpacity>
        </View>

        {/* Real-time Tokens List */}
        <View style={styles.tokensSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Tokens</Text>
            <View style={styles.tokenCount}>
              <Text style={styles.tokenCountText}>
                {tokensLoading ? 'Loading...' : `${tokens.length} tokens`}
              </Text>
            </View>
          </View>

          {tokensLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={web3Colors.primary} />
              <Text style={styles.loadingText}>Loading your tokens...</Text>
            </View>
          ) : tokensError ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color={web3Colors.error} />
              <Text style={styles.errorText}>Failed to load tokens</Text>
              <TouchableOpacity onPress={fetchTokens} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : tokens.length === 0 ? (
            <View style={styles.noTokensContainer}>
              <MaterialCommunityIcons name="wallet-outline" size={48} color={web3Colors.textSecondary} />
              <Text style={styles.noTokensText}>No tokens found</Text>
              <Text style={styles.noTokensSubtext}>Your wallet doesn't contain any tokens yet</Text>
            </View>
          ) : (
            <FlatList
              data={tokens}
              keyExtractor={(item) => item.id}
              renderItem={renderTokenItem}
              scrollEnabled={false}
              contentContainerStyle={styles.tokensList}
              ItemSeparatorComponent={() => <View style={styles.tokenSeparator} />}
            />
          )}
        </View>

        {/* BONK Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[web3Colors.cardBg, web3Colors.border]}
              style={styles.statGradient}
            >
              <MaterialIcons name="card-giftcard" size={32} color={web3Colors.bonk} />
              <Text style={styles.statNumber}>
                {balance ? formatBonkBalance(balance * 0.2) : '0'}
              </Text>
              <Text style={styles.statLabel}>BONK Gifts Received</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[web3Colors.cardBg, web3Colors.border]}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="send" size={32} color={web3Colors.accent} />
              <Text style={styles.statNumber}>
                {balance ? formatBonkBalance(balance * 0.07) : '0'}
              </Text>
              <Text style={styles.statLabel}>BONK Gifts Sent</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Portfolio Summary */}
        {tokens.length > 0 && (
          <View style={styles.portfolioCard}>
            <LinearGradient
              colors={[web3Colors.cardBg, web3Colors.border]}
              style={styles.portfolioGradient}
            >
              <Text style={styles.portfolioTitle}>Portfolio Summary</Text>
              <Text style={styles.portfolioValue}>
                ${tokens.reduce((sum, token) => sum + token.usdValue, 0).toFixed(2)}
              </Text>
              <Text style={styles.portfolioSubtext}>Total value across all tokens</Text>
            </LinearGradient>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

export default GiftsWalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: web3Colors.background,
  },
  header: {
    paddingTop: 50,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,

  },
  autoRefreshStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: web3Colors.cardBg,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  autoRefreshText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginLeft: 6,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: web3Colors.bonk,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 200,
  },
  giftBoxContainer: {
    marginBottom: 20,
  },
  giftBoxGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: web3Colors.bonk,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  balanceInfo: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  bonkAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: web3Colors.bonk,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 16,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletAddressLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginRight: 6,
  },
  walletAddress: {
    fontSize: 12,
    color: web3Colors.text,
    fontFamily: 'monospace',
  },
  noWalletContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  noWalletText: {
    fontSize: 18,
    color: web3Colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },
  noWalletSubtext: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: web3Colors.error,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: web3Colors.bonk,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: web3Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: web3Colors.text,
  },
  tokensSection: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
  },
  tokenCount: {
    backgroundColor: web3Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tokenCountText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    fontWeight: '500',
  },
  noTokensContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: web3Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  noTokensText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },
  noTokensSubtext: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  tokensList: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: web3Colors.cardBg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tokenImageContainer: {
    marginRight: 16,
  },
  tokenImageGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  details: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: web3Colors.text,
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '600',
    color: web3Colors.success,
  },
  tokenBalance: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 6,
  },
  tokenInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenName: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    flex: 1,
  },
  chainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: web3Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chainText: {
    fontSize: 10,
    color: web3Colors.accent,
    marginLeft: 2,
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
  },
  tokenSeparator: {
    height: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    textAlign: 'center',
  },
  portfolioCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  portfolioGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  portfolioTitle: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: web3Colors.success,
    marginBottom: 4,
  },
  portfolioSubtext: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    opacity: 0.8,
  },
  bottomPadding: {
    height: 40,
  },
});