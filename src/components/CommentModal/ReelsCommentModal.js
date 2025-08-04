import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import colors from '../../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import enndpoint from '../../../constants/enndpoint';

const { width, height } = Dimensions.get('window');

// Web3 color scheme
const web3Colors = {
  primary: '#00D4FF',
  secondary: '#9C27B0',
  background: '#0A0A0F',
  surface: '#1A1A2E',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  accent: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FF9800',
};

const ReelsCommentModal = ({
  visible,
  onClose,
  reelId,
  userId,
  endpoint, // This prop might not be passed correctly
}) => {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  const getTimeAgo = timestamp => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffInSeconds = Math.floor((now - posted) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Fixed fetchComments function - using enndpoint.main consistently
  const fetchComments = async () => {
    if (!reelId) {
      console.log('ReelId is missing');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching comments for reel:', reelId);
      
      // Use enndpoint.main consistently (same as in ReelsScreen)
      const url = `${enndpoint.main}api/reels/${reelId}/get-comments`;
      console.log('Fetching from URL:', url);
      
      const res = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Comments response:', res.data);
      setComments(res.data.comments || []);
    } catch (err) {
      console.log('Error fetching comments:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      // Set empty array on error to prevent crash
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fixed postComment function
  const postComment = async () => {
    if (!commentInput.trim() || !reelId) return;
    
    setPosting(true);
    try {
      console.log('Posting comment for reel:', reelId);
      
      const url = `${enndpoint.main}/api/reels/${reelId}/comment`;
      console.log('Posting to URL:', url);
      
      const response = await axios.post(url, {
        uid: userId,
        commentText: commentInput.trim(),
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Comment posted successfully:', response.data);
      setCommentInput('');
      
      // Refresh comments after posting
      await fetchComments();
    } catch (err) {
      console.log('Failed to post comment:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
    } finally {
      setPosting(false);
    }
  };


  const postReplyComment = async () => {
    if (!replyInput.trim() || !reelId || !replyingToComment?.id) {
      console.log('Missing required fields for reply:', {
        replyInput: replyInput,
        reelId: reelId,
        commentId: replyingToComment?.commentId
      });
      return;
    }
    
    setPostingReply(true);
    try {
      console.log('Posting reply to comment:', replyingToComment.commentId);
      
      // Fixed endpoint URL structure
      const url = `http://${endpoint.main}:5000/api/reels/${reelId}/comments/${replyingToComment.commentId}/reply`;
      console.log('Posting reply to URL:', url);
      
      const response = await axios.post(url, {
        uid: userId, 
        replyText: replyInput.trim(),
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Reply posted successfully:', response.data);
 
      setReplyInput('');
      setReplyModalVisible(false);
      setReplyingToComment(null);
      

      await fetchComments();
    } catch (err) {
      console.log('Failed to post reply:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
     
      Alert.alert(
        'Reply Failed',
        'Could not post your reply. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPostingReply(false);
    }
  };


  useEffect(() => {
    if (visible && reelId) {
      console.log('Modal opened, fetching comments for reel:', reelId);
      fetchComments();
    }
    
    // Reset state when modal closes
    if (!visible) {
      setComments([]);
      setCommentInput('');
      setReplyModalVisible(false);
      setReplyingToComment(null);
      setReplyInput('');
    }
  }, [visible, reelId]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.commentItem}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.commentCard}
        >
          <Text style={styles.commentText}>{item.commentText}</Text>

          <View style={styles.replyView}>
            {item.createdAt && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={web3Colors.textSecondary} />
                <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => {
                setReplyingToComment(item);
                setReplyInput('');
                setReplyModalVisible(true);
              }}
            >
              <LinearGradient
                colors={[web3Colors.primary, web3Colors.secondary]}
                style={styles.replyButtonGradient}
              >
                <Ionicons name="chatbubble-outline" size={14} color={web3Colors.text} />
                <Text style={styles.replyText}>Reply</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => console.log('Liked:', item.comment)}
            >
              <View style={styles.likeButtonContent}>
                <Ionicons
                  name={item.likedByUser ? 'heart' : 'heart-outline'}
                  size={16}
                  color={item.likedByUser ? web3Colors.accent : web3Colors.textSecondary}
                />
                <Text style={styles.likeCountText}>{item.likes || 0}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        transparent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={80}
        >
          <View style={styles.overlay}>
            <LinearGradient
              colors={['rgba(10, 10, 15, 0.98)', 'rgba(26, 26, 46, 0.98)']}
              style={styles.container}
            >
              {/* Header */}
              <View style={styles.header}>
                <LinearGradient
                  colors={[web3Colors.primary, web3Colors.secondary]}
                  style={styles.headerGradient}
                >
                  <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                      <Ionicons name="chatbubbles" size={24} color={web3Colors.text} />
                      <Text style={styles.headerText}>Comments</Text>
                     
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <LinearGradient
                        colors={['rgba(255, 68, 68, 0.2)', 'rgba(255, 68, 68, 0.1)']}
                        style={styles.closeButtonGradient}
                      >
                        <Ionicons name="close" size={20} color={web3Colors.accent} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {/* Comments List */}
              <View style={styles.contentContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <LinearGradient
                      colors={[web3Colors.primary, web3Colors.secondary]}
                      style={styles.loadingGradient}
                    >
                      <ActivityIndicator size="large" color={web3Colors.text} />
                    </LinearGradient>
                    <Text style={styles.loadingText}>Loading comments...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={comments}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={
                      <View style={styles.noCommentContainer}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
                          style={styles.noCommentCard}
                        >
                          <Ionicons name="chatbubble-outline" size={48} color={web3Colors.textSecondary} />
                          <Text style={styles.noCommentText}>No comments yet.</Text>
                          <Text style={styles.noCommentSubText}>Be the first to share your thoughts!</Text>
                        </LinearGradient>
                      </View>
                    }
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={fetchComments}
                  />
                )}
              </View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.inputContainer}
                >
                  <View style={styles.inputRow}>
                    <View style={styles.textInputContainer}>
                      <TextInput
                        style={styles.input}
                        value={commentInput}
                        onChangeText={setCommentInput}
                        placeholder="Share your thoughts..."
                        placeholderTextColor={web3Colors.textSecondary}
                        multiline
                        maxLength={500}
                      />
                    </View>
                    <TouchableOpacity 
                      onPress={postComment} 
                      disabled={posting || !commentInput.trim()}
                      style={styles.postButtonContainer}
                    >
                      <LinearGradient
                        colors={posting || !commentInput.trim() 
                          ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                          : [web3Colors.primary, web3Colors.secondary]
                        }
                        style={styles.postButton}
                      >
                        {posting ? (
                          <ActivityIndicator size="small" color={web3Colors.text} />
                        ) : (
                          <Ionicons name="send" size={18} color={web3Colors.text} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.replyOverlay}>
          <LinearGradient
            colors={['rgba(10, 10, 15, 0.95)', 'rgba(26, 26, 46, 0.95)']}
            style={styles.replyContainer}
          >
            <View style={styles.replyHeader}>
              <LinearGradient
                colors={[web3Colors.primary, web3Colors.secondary]}
                style={styles.replyHeaderGradient}
              >
                <Ionicons name="arrow-undo" size={20} color={web3Colors.text} />
                <Text style={styles.replyHeaderText}>Reply to Comment</Text>
              </LinearGradient>
            </View>

            <View style={styles.replyContent}>
               <Text style={styles.replyingToText}>
    {replyingToComment 
      ? `"${replyingToComment.commentText?.slice(0, 80) || ''}${replyingToComment.commentText?.length > 80 ? '...' : ''}"`
      : 'Replying to comment...'}
  </Text>

              <View style={styles.replyInputContainer}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.replyInputGradient}
                >
                  <TextInput
                    placeholder="Write your reply..."
                    style={styles.replyInput}
                    placeholderTextColor={web3Colors.textSecondary}
                    value={replyInput}
                    onChangeText={setReplyInput}
                    multiline
                    maxLength={300}
                  />
                </LinearGradient>
              </View>

              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.cancelReplyButton}
                  onPress={() => {
                    setReplyModalVisible(false);
                    setReplyingToComment(null);
                    setReplyInput('');
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255, 68, 68, 0.2)', 'rgba(255, 68, 68, 0.1)']}
                    style={styles.cancelReplyGradient}
                  >
                    <Text style={styles.cancelReplyText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sendReplyButton}
                  onPress={postReplyComment}
                  disabled={postingReply || !replyInput.trim()}
                >
                  <LinearGradient
                    colors={postingReply || !replyInput.trim()
                      ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                      : [web3Colors.primary, web3Colors.secondary]
                    }
                    style={styles.sendReplyGradient}
                  >
                    {postingReply ? (
                      <ActivityIndicator size="small" color={web3Colors.text} />
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color={web3Colors.text} />
                        <Text style={styles.sendReplyText}>Send Reply</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
};

export default ReelsCommentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: web3Colors.border,
    elevation: 20,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerGradient: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 1,
  },
  headerContent: {
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginLeft: 12,
    fontFamily: 'comicsansbold',
  },
  reelIdText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginLeft: 8,
    fontFamily: 'comicintalics',
  },
  closeButton: {
    borderRadius: 20,
  },
  closeButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 16,
  },
  loadingText: {
    color: web3Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'comicintalics',
  },
  commentItem: {
    marginBottom: 12,
  },
  commentCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  commentText: {
    color: web3Colors.text,
    fontSize: 16,
    fontFamily: 'comicNormal',
    lineHeight: 22,
    marginBottom: 12,
  },
  replyView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: web3Colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  replyButton: {
    borderRadius: 12,
  },
  replyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  replyText: {
    color: web3Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  likeButton: {
    borderRadius: 12,
  },
  likeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCountText: {
    color: web3Colors.textSecondary,
    marginLeft: 4,
    fontSize: 12,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
  },
  inputContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  input: {
    color: web3Colors.text,
    fontSize: 16,
    fontFamily: 'comicintalics',
    maxHeight: 100,
    minHeight: 20,
  },
  postButtonContainer: {
    borderRadius: 20,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCommentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noCommentCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  noCommentText: {
    color: web3Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noCommentSubText: {
    color: web3Colors.textSecondary,
    fontSize: 14,
    opacity: 0.7,
  },
  replyOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
  },
  replyContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    elevation: 20,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  replyHeader: {
    padding: 20,
    paddingBottom: 0,
  },
  replyHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  replyHeaderText: {
    color: web3Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  replyContent: {
    padding: 20,
  },
  replyingToText: {
    color: web3Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: web3Colors.primary,
  },
  replyInputContainer: {
    marginBottom: 20,
  },
  replyInputGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
    padding: 16,
  },
  replyInput: {
    color: web3Colors.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelReplyButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  cancelReplyGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelReplyText: {
    color: web3Colors.accent,
    fontWeight: '600',
  },
  sendReplyButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  sendReplyGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  sendReplyText: {
    color: web3Colors.text,
    fontWeight: '600',
    marginLeft: 6,
  },
});