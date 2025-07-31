import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { web3Colors } from '../../../utils/ConstantUtils';
import { styles } from '../../../utils/MemeStyles';

const MemeCard = ({
  item,
  isOwnPost,
  hasWallet,
  canReceiveGifts,
  walletAddress,
  walletReady,
  likedPosts,
  animatedScales,
  onLike,
  onShare,
  onComment,
  onOpenGift,
  refreshConnection,
  renderMedia,
  WalletAddress
}) => {
  const handleGiftPress = () => {
    if (isOwnPost) {
      Alert.alert(
        'Your Own Meme', 
        'This is your meme! You cannot send gifts to yourself.',
        [{ text: 'Got it', style: 'default' }]
      );
    } else if (!hasWallet) {
      Alert.alert(
        'Invalid Wallet', 
        'This memer does not have a valid Solana wallet address.',
        [{ text: 'Understood', style: 'default' }]
      );
    } else if (!walletReady) {
      Alert.alert(
        'Wallet Not Ready', 
        'Your wallet is not properly connected. Please refresh.',
        [{ text: 'Refresh', onPress: refreshConnection }]
      );
    } else {
      onOpenGift(item);
    }
  };

  return (
    <View style={styles.memeCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={isOwnPost 
                ? [web3Colors.success, web3Colors.secondary] 
                : hasWallet
                ? [web3Colors.meme, web3Colors.viral]
                : [web3Colors.warning, web3Colors.accent]
              }
              style={styles.avatarGradient}
            >
              <View style={styles.avatar}>
                <MaterialCommunityIcons 
                  name={isOwnPost 
                    ? "account-check" 
                    : hasWallet 
                    ? "emoticon-lol" 
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
                {item.owner?.username || item.userDisplayName || item.userName || 'Anonymous Memer'}
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
              <View style={styles.memeBadge}>
                <MaterialCommunityIcons name="emoticon-lol-outline" size={10} color="white" />
                <Text style={styles.memeBadgeText}>MEME</Text>
              </View>
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
      
      <Text style={styles.memeText}>{item.memeText}</Text>
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
          onPress={() => onLike(item.id)}
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
          onPress={() => onComment(item?.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={web3Colors.textSecondary} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(item.id)}
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
          onPress={handleGiftPress}
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
            {isOwnPost ? 'MY MEME' : !hasWallet ? 'NO WALLET' : !walletReady ? 'NOT READY' : 'BONK'}
          </Text>
        </TouchableOpacity>
      </View>

      {item.gifts && item.gifts.length > 0 && (
        <View style={styles.giftsPreview}>
          <Text style={styles.giftsPreviewTitle}>
            🎁 Recent BONK Gifts ({item.gifts.length} total):
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

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={[web3Colors.meme, web3Colors.viral]}
      style={styles.loadingGradient}
    >
      <ActivityIndicator size="large" color="white" />
    </LinearGradient>
    <Text style={styles.loadingText}>Loading viral memes...</Text>
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <LinearGradient
      colors={[web3Colors.cardBg, 'rgba(255, 215, 0, 0.1)']}
      style={styles.emptyCard}
    >
      <MaterialCommunityIcons name="emoticon-lol" size={60} color={web3Colors.meme} />
      <Text style={styles.emptyTitle}>No Memes Yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to share viral Web3 memes!</Text>
    </LinearGradient>
  </View>
);

const FloatingActionButton = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <LinearGradient
      colors={[web3Colors.meme, web3Colors.viral, web3Colors.gradient3]}
      style={styles.fabGradient}
    >
      <MaterialCommunityIcons name="emoticon-lol" size={28} color="white" />
    </LinearGradient>
  </TouchableOpacity>
);

const GiftModal = ({
  visible,
  selectedPost,
  giftAmount,
  giftLoading,
  userPublicKey,
  walletReady,
  userBonkBalance,
  balanceLoading,
  onClose,
  onAmountChange,
  onSetMax,
  onSendGift,
  fetchBalance,
  hasValidWallet
}) => {
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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.giftModalContent}>
          <LinearGradient
            colors={[web3Colors.meme, web3Colors.viral]}
            style={styles.giftModalHeader}
          >
            <MaterialIcons name="card-giftcard" size={32} color="white" />
            <Text style={styles.giftModalTitle}>Send BONK for Meme 😂</Text>
          </LinearGradient>

          <ScrollView 
            style={styles.giftModalBodyFixed}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
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

            <View style={styles.giftRecipientCard}>
              <Text style={styles.giftRecipientLabel}>Sending BONK to memer:</Text>
              <Text style={styles.giftRecipientName}>
                @{selectedPost?.owner?.username || selectedPost?.userDisplayName || selectedPost?.userName || 'Anonymous Memer'}
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
                😂 Reward epic memes with BONK - using your existing wallet session! 🔥
              </Text>
            </View>

            <View style={styles.giftInputContainer}>
              <Text style={styles.giftInputLabel}>BONK Amount</Text>
              <View style={styles.giftAmountInputRow}>
                <TextInput
                  style={[
                    styles.giftAmountInput,
                    (!userPublicKey || balanceLoading || !walletReady) && styles.giftAmountInputDisabled
                  ]}
                  value={giftAmount}
                  onChangeText={onAmountChange}
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
                  onPress={onSetMax}
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
                    onPress={() => onAmountChange(amount.toString())}
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

            <View style={styles.giftPostPreviewCard}>
              <Text style={styles.giftPreviewLabel}>Gifting for this meme:</Text>
              <View style={styles.giftMiniPostPreview}>
                <Text style={styles.giftMiniPostCaption}>
                  {selectedPost?.memeText?.length > 100 
                    ? selectedPost.memeText.slice(0, 100) + '...' 
                    : selectedPost?.memeText}
                </Text>
                <Text style={styles.giftMiniPostMeta}>
                  by @{selectedPost?.owner?.username || selectedPost?.userDisplayName || selectedPost?.userName || 'Anonymous Memer'}
                </Text>
              </View>
            </View>

            {walletReady && giftAmount && parseFloat(giftAmount) > 0 && (
              <View style={styles.giftTransactionInfo}>
                <Text style={styles.giftTransactionTitle}>😂 Meme Reward Transaction:</Text>
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
                  🚨 Real BONK tokens will be transferred to reward this meme!
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.giftModalActions}>
            <TouchableOpacity
              style={styles.giftCancelButton}
              onPress={onClose}
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
              onPress={onSendGift}
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
  );
};

const CreateMemeModal = ({
  visible,
  memeText,
  selectedMedia,
  submitting,
  onClose,
  onTextChange,
  onMediaChange,
  onPickMedia,
  onSubmit
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <LinearGradient
        colors={[web3Colors.background, '#1A1B3A']}
        style={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Viral Meme</Text>
          <TouchableOpacity
            onPress={onClose}
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
            <Text style={styles.inputLabel}>What's your meme caption? 😂</Text>
            <TextInput
              placeholder="Drop your hottest meme text here..."
              placeholderTextColor={web3Colors.textSecondary}
              style={styles.captionInput}
              value={memeText}
              onChangeText={onTextChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.pickButton}
            onPress={onPickMedia}
          >
            <LinearGradient
              colors={[web3Colors.meme, web3Colors.viral]}
              style={styles.pickButtonGradient}
            >
              <Ionicons 
                name={selectedMedia.length > 0 ? "images" : "add-circle"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.pickButtonText}>
                {selectedMedia.length > 0 ? `${selectedMedia.length} Media Selected` : 'Add Meme Media'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {selectedMedia.length > 0 && (
            <View style={styles.mediaPreviewSection}>
              <Text style={styles.previewLabel}>Meme Preview:</Text>
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
                        onMediaChange(newMedia);
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
            <Text style={styles.featuresTitle}>😂 Viral Meme Features</Text>
            <Text style={styles.featuresText}>
              • Earn real BONK tokens from your viral content{'\n'}
              • No wallet reconnection needed for BONK gifts{'\n'}
              • Lightning-fast meme monetization{'\n'}
              • Real blockchain rewards for creativity{'\n'}
              • Join the Web3 meme economy
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onSubmit}
            disabled={submitting}
          >
            <LinearGradient
              colors={submitting 
                ? [web3Colors.textSecondary, web3Colors.textSecondary] 
                : [web3Colors.meme, web3Colors.viral]
              }
              style={styles.actionBtnGradient}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="emoticon-lol" size={20} color="white" />
              )}
              <Text style={styles.actionBtnText}>
                {submitting ? 'Publishing Meme...' : 'Publish Meme'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onClose}
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
);

export default {
  MemeCard,
  LoadingScreen,
  EmptyState,
  FloatingActionButton,
  GiftModal,
  CreateMemeModal
};