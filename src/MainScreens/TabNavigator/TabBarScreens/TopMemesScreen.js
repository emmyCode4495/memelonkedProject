// TopMemesScreen.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
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
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
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

import { executeStreamlinedBonkTransfer } from './bonkTransfer';
import { AuthContext } from '../../../persistence/AuthContext';
import enndpoint from '../../../../constants/enndpoint';
import CommentModal from '../../../components/CommentModal/CommentModal';
import MemeComponents from '../../../components/AIRoastComponents/MemeCard';
import { BONK_CONFIG, convertToPublicKey, createReliableConnection, getValidUserId, useBonkBalance, useStreamlinedWallet, validateWalletAddress, web3Colors } from '../../../../utils/ConstantUtils';


const { width } = Dimensions.get('window');

/**
 * Main TopMemesScreen Component
 */
const TopMemesScreen = () => {
  // State Management
  const [memesFeed, setMemesFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [memeText, setMemeText] = useState('');
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

  // Context and Hooks
  const { user, walletInfo } = useContext(AuthContext);
  
  const { 
    isReady: walletReady,
    publicKey: userPublicKey,
    isConnected,
    sessionError,
    refreshConnection,
    walletAddress
  } = useStreamlinedWallet();
  
  const { 
  MemeCard, 
  LoadingScreen, 
  EmptyState, 
  FloatingActionButton,
  GiftModal,
  CreateMemeModal
} = MemeComponents;


  const { 
    balance: userBonkBalance, 
    loading: balanceLoading, 
    fetchBalance,
    refreshAfterTransaction,
    currentWallet
  } = useBonkBalance(userPublicKey, walletAddress);

  // Effects
  useEffect(() => {
    fetchMemesFeed();
  }, []);

  // Data Fetching Functions
  const fetchMemesFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${enndpoint.main}/api/memes/get/all-memes`);
      if (res.data && Array.isArray(res.data)) {
        const sortedMemes = res.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(meme => ({
            ...meme,
            owner: {
              username: `memer_${meme.userId?.slice(-4) || Math.random().toString(36).substr(2, 4)}`,
              walletAddress: meme.userWallet || null
            },
            comments: meme.comments || [],
            likes: meme.likes || [],
            gifts: meme.gifts || [],
            shares: meme.shares || []
          }));
        setMemesFeed(sortedMemes);
      } else {
        Alert.alert('Error', 'Invalid data received from server.');
        setMemesFeed([]);
      }
    } catch (err) {
      console.error('Fetch Memes Feed Error:', err);
      Alert.alert('Error', 'Failed to fetch memes feed. Please try again.');
      setMemesFeed([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
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

  const handleLike = async (memeId) => {
    if (likedPosts[memeId]) return;

    const newScale = new Animated.Value(0);
    setAnimatedScales(prev => ({ ...prev, [memeId]: newScale }));

    try {
      setLikedPosts(prev => ({ ...prev, [memeId]: true }));

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

      await axios.post(`${enndpoint.main}/api/memes/${memeId}/like`, {
        userId: getValidUserId(user, walletInfo),
      });

      setMemesFeed(prevFeed => 
        prevFeed.map(meme => {
          if (meme.id === memeId) {
            const currentLikes = Array.isArray(meme.likes) ? meme.likes : [];
            return {
              ...meme,
              likes: [...currentLikes, { userId: getValidUserId(user, walletInfo) }]
            };
          }
          return meme;
        })
      );
    } catch (error) {
      console.error('Error liking meme:', error.message);
      setLikedPosts(prev => ({ ...prev, [memeId]: false }));
    }
  };

  const handleShare = async (memeId) => {
    try {
      const memeLink = `https://your-app.com/memes/${memeId}`;
      const result = await Share.share({
        message: `😂 Check out this viral meme and send some BONK! ${memeLink}`,
        url: memeLink,
        title: '🚀 Check out this BONK-powered meme!',
      });

      if (result.action === Share.sharedAction) {
        console.log('Meme shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share the meme.');
      console.error('Share Error:', error);
    }
  };

  const handleCreateMeme = async () => {
    if (!memeText || selectedMedia.length === 0) {
      Alert.alert('Missing fields', 'Meme text and media are required.');
      return;
    }

    try {
      setSubmitting(true);
      const memeData = {
        userId: getValidUserId(user, walletInfo),
        memeText,
        mediaItems: selectedMedia.map(media => ({
          url: media.uri,
          type: media.type,
        })),
      };

      await axios.post(`${enndpoint.main}/api/memes/create`, memeData);
      setShowModal(false);
      setMemeText('');
      setSelectedMedia([]);
      fetchMemesFeed();
    } catch (error) {
      let errorMessage = 'Failed to create meme.';
      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message || JSON.stringify(error.response.data);
        errorMessage = `Server Error (${status}): ${backendMessage}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = `Unexpected error: ${error.message}`;
      }

      console.error('Create Meme Error:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Gift Functions
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
        'Cannot Gift Own Meme', 
        'You cannot send a gift to your own meme. Share it with others to receive gifts!',
        [{ text: 'Got it', style: 'default' }]
      );
      return;
    }

    if (!hasValidWallet(post)) {
      Alert.alert(
        'Invalid Recipient Wallet', 
        'The meme creator does not have a valid Solana wallet address.',
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    setSelectedPost(post);
    setSelectedPostId(post.id);
    setGiftModalVisible(true);
  };

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
      Alert.alert('Error', 'Meme information not found.');
      return;
    }

    const amount = parseFloat(giftAmount);

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

      console.log('🎁 Preparing BONK gift for meme with session validation:', {
        recipient: recipientWalletAddress,
        amount: amount.toLocaleString(),
        meme: selectedPostId
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
        postType: 'meme',
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
      
      // Execute blockchain transfer
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
          updateMemeGifts(amount);
          
          // Show success
          Alert.alert(
            '🎉 BONK Gift Sent Successfully!',
            `${amount.toLocaleString()} BONK sent to @${selectedPost.owner?.username || 'Anonymous'} for their epic meme!\n\n✅ Confirmed on Solana blockchain`,
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
          
          console.log('🎉 BONK gift for meme completed successfully!');
        }
      }

    } catch (error) {
      console.error('💥 BONK gift failed:', error);
      
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

  const updateMemeGifts = (amount) => {
    setMemesFeed(prevFeed => 
      prevFeed.map(meme => {
        if (meme.id === selectedPostId) {
          const currentGifts = Array.isArray(meme.gifts) ? meme.gifts : [];
          return {
            ...meme,
            gifts: [...currentGifts, { 
              amount, 
              token: 'BONK', 
              userId: getValidUserId(user, walletInfo),
              senderName: user?.username || user?.displayName || 'Anonymous',
              timestamp: new Date().toISOString()
            }]
          };
        }
        return meme;
      })
    );
  };

  // Media Functions
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

  // Gift Amount Handlers
  const handleGiftAmountChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }
    
    if (parts[1] && parts[1].length > BONK_CONFIG.DECIMALS) {
      parts[1] = parts[1].substring(0, BONK_CONFIG.DECIMALS);
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

  // Render Functions
  const renderMedia = (mediaItems) => {
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
              Authenticated • Ready to send BONK for memes
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

  const renderItem = ({ item }) => {
    const isOwnPost = isCurrentUserPost(item);
    const hasWallet = hasValidWallet(item);
    const canReceiveGifts = !isOwnPost && hasWallet;
    const walletAddress = item.owner?.walletAddress || item.userWallet;

    return (
      <MemeCard
        item={item}
        isOwnPost={isOwnPost}
        hasWallet={hasWallet}
        canReceiveGifts={canReceiveGifts}
        walletAddress={walletAddress}
        walletReady={walletReady}
        likedPosts={likedPosts}
        animatedScales={animatedScales}
        onLike={handleLike}
        onShare={handleShare}
        onComment={(postId) => {
          setSelectedPostId(postId);
          setCommentModalVisible(true);
        }}
        onOpenGift={openGiftModal}
        refreshConnection={refreshConnection}
        renderMedia={renderMedia}
        WalletAddress={WalletAddress}
      />
    );
  };

  // Main Render
  return (
    <LinearGradient
      colors={[web3Colors.background, '#1A1B3A', web3Colors.background]}
      style={{flex:1}}
    >
      <StreamlinedWalletStatus />

      {loading ? (
        <LoadingScreen />
      ) : memesFeed.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={memesFeed}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 50 }}/> }
        />
      )}

      <FloatingActionButton onPress={() => setShowModal(true)} />

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

      <GiftModal
        visible={giftModalVisible}
        selectedPost={selectedPost}
        giftAmount={giftAmount}
        giftLoading={giftLoading}
        userPublicKey={userPublicKey}
        walletReady={walletReady}
        userBonkBalance={userBonkBalance}
        balanceLoading={balanceLoading}
        onClose={() => {
          setGiftModalVisible(false);
          setGiftAmount('');
          setSelectedPost(null);
        }}
        onAmountChange={handleGiftAmountChange}
        onSetMax={setMaxGiftAmount}
        onSendGift={handleStreamlinedSendGift}
        fetchBalance={fetchBalance}
        hasValidWallet={hasValidWallet}
      />

      <CreateMemeModal
        visible={showModal}
        memeText={memeText}
        selectedMedia={selectedMedia}
        submitting={submitting}
        onClose={() => setShowModal(false)}
        onTextChange={setMemeText}
        onMediaChange={setSelectedMedia}
        onPickMedia={pickMedia}
        onSubmit={handleCreateMeme}
      />
    </LinearGradient>
  );
};

export default TopMemesScreen;

export const styles = StyleSheet.create({
  
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
    paddingBottom:50
   
  },
  
  // Meme Card Styles
  memeCard: {
    backgroundColor: web3Colors.cardBg,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
    shadowColor: web3Colors.meme,
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
    marginRight: 4,
  },
  invalidWalletBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 2,
  },
  memeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: web3Colors.meme,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memeBadgeText: {
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
  
  // Meme Text
  memeText: {
    fontSize: 16,
    color: web3Colors.text,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
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
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: web3Colors.meme,
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