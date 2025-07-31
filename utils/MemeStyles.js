
import { StyleSheet, Dimensions } from 'react-native';
import { web3Colors } from './ConstantUtils';


const { width } = Dimensions.get('window');

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
    bottom: 150,
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