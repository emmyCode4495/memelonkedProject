// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import axios from 'axios';
// import colors from '../../../constants/colors';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import enndpoint from '../../../constants/enndpoint';

// const { width, height } = Dimensions.get('window');

// // Web3 color scheme
// const web3Colors = {
//   primary: '#00D4FF',
//   secondary: '#9C27B0',
//   background: '#0A0A0F',
//   surface: '#1A1A2E',
//   border: 'rgba(255, 255, 255, 0.1)',
//   text: '#FFFFFF',
//   textSecondary: 'rgba(255, 255, 255, 0.7)',
//   accent: '#FF6B6B',
//   success: '#4CAF50',
//   warning: '#FF9800',
// };

// const CommentModal = ({
//   visible,
//   onClose,
//   postId,
//   userId,
//   endpoint,
//   commentId, // This will be used for fetching replies to a specific comment
// }) => {
//   const [comments, setComments] = useState([]);
//   const [commentInput, setCommentInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [posting, setPosting] = useState(false);

//   const [replyModalVisible, setReplyModalVisible] = useState(false);
//   const [replyingToComment, setReplyingToComment] = useState(null);
//   const [replyInput, setReplyInput] = useState('');
//   const [postingReply, setPostingReply] = useState(false);

//   // Determine if we're showing replies to a specific comment or all comments
//   const isShowingReplies = !!commentId;

//   const getTimeAgo = timestamp => {
//     const now = new Date();
//     const posted = new Date(timestamp);
//     const diffInSeconds = Math.floor((now - posted) / 1000);

//     if (diffInSeconds < 60) {
//       return `${diffInSeconds}s ago`;
//     }

//     const diffInMinutes = Math.floor(diffInSeconds / 60);
//     if (diffInMinutes < 60) {
//       return `${diffInMinutes}m ago`;
//     }

//     const diffInHours = Math.floor(diffInMinutes / 60);
//     if (diffInHours < 24) {
//       return `${diffInHours}h ago`;
//     }

//     const diffInDays = Math.floor(diffInHours / 24);
//     return `${diffInDays}d ago`;
//   };

//   // Fetch all comments for a post
//   const fetchComments = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `http://${enndpoint.main}:5000/api/newsfeed/${postId}/comments`,
//       );
//       setComments(res.data.comments || []);
//     } catch (err) {
//       console.error('Error fetching comments:', err);
//       setComments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch replies to a specific comment
//   const fetchReplyComments = async () => {
//     if (!commentId) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `http://${enndpoint.main}:5000/api/newsfeed/${postId}/comment/${commentId}/replies`,
//       );
//       setComments(res.data.replies || []);
//     } catch (err) {
//       console.error('Error fetching reply comments:', err);
//       setComments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Post a new comment to the post
//   const postComment = async () => {
//     if (!commentInput.trim()) return;
//     setPosting(true);
//     try {
//       const response = await axios.post(
//         `http://${enndpoint.main}:5000/api/newsfeed/${postId}/comment`,
//         {
//           userId,
//           comment: commentInput.trim(),
//         },
//       );
//       setCommentInput('');
      
//       // Add the new comment to the list immediately for better UX
//       if (response.data.comment) {
//         setComments(prevComments => [response.data.comment, ...prevComments]);
//       } else {
//         // Fallback: refetch all comments
//         await fetchComments();
//       }
//     } catch (err) {
//       console.error('Failed to post comment:', err);
//       // Optionally show an error message to the user
//     } finally {
//       setPosting(false);
//     }
//   };

//   // Post a reply to a specific comment
//   const postReplyComment = async (parentCommentId, replyText) => {
//     if (!replyText.trim()) return;
//     setPostingReply(true);
//     try {
//       const response = await axios.post(
//         `http://${enndpoint.main}:5000/api/newsfeed/${postId}/comment/${parentCommentId}/reply`,
//         {
//           userId,
//           reply: replyText.trim(),
//         },
//       );
      
//       // Add the new reply to the list immediately for better UX
//       if (response.data.reply) {
//         setComments(prevComments => [response.data.reply, ...prevComments]);
//       } else {
//         // Fallback: refetch comments/replies
//         if (isShowingReplies) {
//           await fetchReplyComments();
//         } else {
//           await fetchComments();
//         }
//       }
//     } catch (err) {
//       console.error('Failed to post reply:', err);
//       // Optionally show an error message to the user
//     } finally {
//       setPostingReply(false);
//     }
//   };

//   // Handle liking a comment
//   const handleLikeComment = async (commentItemId) => {
//     try {
//       const response = await axios.post(
//         `http://${enndpoint.main}:5000/api/newsfeed/comment/${commentItemId}/like`,
//         { userId }
//       );
      
//       // Update the comment in the local state
//       setComments(prevComments => 
//         prevComments.map(comment => 
//           comment.id === commentItemId 
//             ? { 
//                 ...comment, 
//                 likes: response.data.likes || (comment.likes || 0) + (comment.likedByUser ? -1 : 1),
//                 likedByUser: !comment.likedByUser 
//               }
//             : comment
//         )
//       );
//     } catch (err) {
//       console.error('Failed to like comment:', err);
//     }
//   };

//   // Fetch data when modal becomes visible
//   useEffect(() => {
//     if (visible) {
//       if (isShowingReplies) {
//         fetchReplyComments();
//       } else {
//         fetchComments();
//       }
//     }
//   }, [visible, commentId]);

//   const renderItem = ({ item }) => {
//     return (
//       <View style={styles.commentItem}>
//         <LinearGradient
//           colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
//           style={styles.commentCard}
//         >
//           {/* Display username if available */}
//           {item.username && (
//             <Text style={styles.usernameText}>@{item.username}</Text>
//           )}
          
//           <Text style={styles.commentText}>
//             {item.comment || item.commentText || item.reply || item.replyText}
//           </Text>

//           <View style={styles.replyView}>
//             {item.createdAt && (
//               <View style={styles.timeContainer}>
//                 <Ionicons name="time-outline" size={12} color={web3Colors.textSecondary} />
//                 <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
//               </View>
//             )}

//             {/* Only show reply button if we're not already showing replies */}
//             {!isShowingReplies && (
//               <TouchableOpacity
//                 style={styles.replyButton}
//                 onPress={() => {
//                   setReplyingToComment(item);
//                   setReplyInput('');
//                   setReplyModalVisible(true);
//                 }}
//               >
//                 <LinearGradient
//                   colors={[web3Colors.primary, web3Colors.secondary]}
//                   style={styles.replyButtonGradient}
//                 >
//                   <Ionicons name="chatbubble-outline" size={14} color={web3Colors.text} />
//                   <Text style={styles.replyText}>Reply</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={styles.likeButton}
//               onPress={() => handleLikeComment(item.id)}
//             >
//               <View style={styles.likeButtonContent}>
//                 <Ionicons
//                   name={item.likedByUser ? 'heart' : 'heart-outline'}
//                   size={16}
//                   color={item.likedByUser ? web3Colors.accent : web3Colors.textSecondary}
//                 />
//                 <Text style={styles.likeCountText}>{item.likes || 0}</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>
//       </View>
//     );
//   };

//   return (
//     <>
//       <Modal
//         visible={visible}
//         animationType="slide"
//         onRequestClose={onClose}
//         transparent
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           style={{ flex: 1 }}
//           keyboardVerticalOffset={80}
//         >
//           <View style={styles.overlay}>
//             <LinearGradient
//               colors={['rgba(10, 10, 15, 0.98)', 'rgba(26, 26, 46, 0.98)']}
//               style={styles.container}
//             >
//               {/* Header */}
//               <View style={styles.header}>
//                 <LinearGradient
//                   colors={[web3Colors.primary, web3Colors.secondary]}
//                   style={styles.headerGradient}
//                 >
//                   <View style={styles.headerContent}>
//                     <View style={styles.headerLeft}>
//                       <Ionicons name="chatbubbles" size={24} color={web3Colors.text} />
//                       <Text style={styles.headerText}>
//                         {isShowingReplies ? 'Replies' : 'Comments'}
//                       </Text>
//                     </View>
//                     <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//                       <LinearGradient
//                         colors={['rgba(255, 68, 68, 0.2)', 'rgba(255, 68, 68, 0.1)']}
//                         style={styles.closeButtonGradient}
//                       >
//                         <Ionicons name="close" size={20} color={web3Colors.accent} />
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </View>
//                 </LinearGradient>
//               </View>

//               {/* Comments List */}
//               <View style={styles.contentContainer}>
//                 {loading ? (
//                   <View style={styles.loadingContainer}>
//                     <LinearGradient
//                       colors={[web3Colors.primary, web3Colors.secondary]}
//                       style={styles.loadingGradient}
//                     >
//                       <ActivityIndicator size="large" color={web3Colors.text} />
//                     </LinearGradient>
//                     <Text style={styles.loadingText}>
//                       Loading {isShowingReplies ? 'replies' : 'comments'}...
//                     </Text>
//                   </View>
//                 ) : (
//                   <FlatList
//                     data={comments}
//                     keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//                     renderItem={renderItem}
//                     ListEmptyComponent={
//                       <View style={styles.noCommentContainer}>
//                         <LinearGradient
//                           colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
//                           style={styles.noCommentCard}
//                         >
//                           <Ionicons name="chatbubble-outline" size={48} color={web3Colors.textSecondary} />
//                           <Text style={styles.noCommentText}>
//                             No {isShowingReplies ? 'replies' : 'comments'} yet.
//                           </Text>
//                           <Text style={styles.noCommentSubText}>
//                             Be the first to share your thoughts!
//                           </Text>
//                         </LinearGradient>
//                       </View>
//                     }
//                     style={{ flex: 1 }}
//                     showsVerticalScrollIndicator={false}
//                   />
//                 )}
//               </View>

//               {/* Input Section */}
//               <View style={styles.inputSection}>
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
//                   style={styles.inputContainer}
//                 >
//                   <View style={styles.inputRow}>
//                     <View style={styles.textInputContainer}>
//                       <TextInput
//                         style={styles.input}
//                         value={commentInput}
//                         onChangeText={setCommentInput}
//                         placeholder={isShowingReplies ? "Add a reply..." : "Share your thoughts..."}
//                         placeholderTextColor={web3Colors.textSecondary}
//                         multiline
//                       />
//                     </View>
//                     <TouchableOpacity 
//                       onPress={() => {
//                         if (isShowingReplies) {
//                           postReplyComment(commentId, commentInput);
//                         } else {
//                           postComment();
//                         }
//                       }}
//                       disabled={posting || !commentInput.trim()}
//                       style={styles.postButtonContainer}
//                     >
//                       <LinearGradient
//                         colors={posting || !commentInput.trim() 
//                           ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
//                           : [web3Colors.primary, web3Colors.secondary]
//                         }
//                         style={styles.postButton}
//                       >
//                         {posting ? (
//                           <ActivityIndicator size="small" color={web3Colors.text} />
//                         ) : (
//                           <Ionicons name="send" size={18} color={web3Colors.text} />
//                         )}
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </View>
//                 </LinearGradient>
//               </View>
//             </LinearGradient>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Reply Modal */}
//       <Modal
//         visible={replyModalVisible}
//         animationType="fade"
//         transparent
//         onRequestClose={() => setReplyModalVisible(false)}
//       >
//         <View style={styles.replyOverlay}>
//           <LinearGradient
//             colors={['rgba(10, 10, 15, 0.95)', 'rgba(26, 26, 46, 0.95)']}
//             style={styles.replyContainer}
//           >
//             <View style={styles.replyHeader}>
//               <LinearGradient
//                 colors={[web3Colors.primary, web3Colors.secondary]}
//                 style={styles.replyHeaderGradient}
//               >
//                 <Ionicons name="arrow-undo" size={20} color={web3Colors.text} />
//                 <Text style={styles.replyHeaderText}>Reply to Comment</Text>
//               </LinearGradient>
//             </View>

//             <View style={styles.replyContent}>
//               <Text style={styles.replyingToText}>
//                 "{(replyingToComment?.comment || replyingToComment?.commentText || '').slice(0, 80)}{(replyingToComment?.comment || replyingToComment?.commentText || '').length > 80 ? '...' : ''}"
//               </Text>

//               <View style={styles.replyInputContainer}>
//                 <LinearGradient
//                   colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
//                   style={styles.replyInputGradient}
//                 >
//                   <TextInput
//                     placeholder="Write your reply..."
//                     style={styles.replyInput}
//                     placeholderTextColor={web3Colors.textSecondary}
//                     value={replyInput}
//                     onChangeText={setReplyInput}
//                     multiline
//                   />
//                 </LinearGradient>
//               </View>

//               <View style={styles.replyActions}>
//                 <TouchableOpacity
//                   style={styles.cancelReplyButton}
//                   onPress={() => setReplyModalVisible(false)}
//                 >
//                   <LinearGradient
//                     colors={['rgba(255, 68, 68, 0.2)', 'rgba(255, 68, 68, 0.1)']}
//                     style={styles.cancelReplyGradient}
//                   >
//                     <Text style={styles.cancelReplyText}>Cancel</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.sendReplyButton}
//                   onPress={async () => {
//                     if (!replyInput.trim() || !replyingToComment) return;
                    
//                     await postReplyComment(replyingToComment.id, replyInput);
//                     setReplyInput('');
//                     setReplyModalVisible(false);
//                   }}
//                   disabled={postingReply || !replyInput.trim()}
//                 >
//                   <LinearGradient
//                     colors={postingReply || !replyInput.trim()
//                       ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
//                       : [web3Colors.primary, web3Colors.secondary]
//                     }
//                     style={styles.sendReplyGradient}
//                   >
//                     {postingReply ? (
//                       <ActivityIndicator size="small" color={web3Colors.text} />
//                     ) : (
//                       <>
//                         <Ionicons name="send" size={16} color={web3Colors.text} />
//                         <Text style={styles.sendReplyText}>Send Reply</Text>
//                       </>
//                     )}
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </LinearGradient>
//         </View>
//       </Modal>
//     </>
//   );
// };

// export default CommentModal;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//   },
//   container: {
//     height: '75%',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     elevation: 20,
//     shadowColor: web3Colors.primary,
//     shadowOffset: { width: 0, height: -8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//   },
//   header: {
//     paddingTop: 20,
//     paddingBottom: 15,
//   },
//   headerGradient: {
//     marginHorizontal: 20,
//     borderRadius: 16,
//     padding: 1,
//   },
//   headerContent: {
//     backgroundColor: 'rgba(10, 10, 15, 0.9)',
//     borderRadius: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginLeft: 12,
//     fontFamily: 'comicsansbold',
//   },
//   closeButton: {
//     borderRadius: 20,
//   },
//   closeButtonGradient: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
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
//     marginBottom: 16,
//   },
//   loadingText: {
//     color: web3Colors.textSecondary,
//     fontSize: 16,
//     fontFamily: 'comicintalics',
//   },
//   commentItem: {
//     marginBottom: 12,
//   },
//   commentCard: {
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   usernameText: {
//     color: web3Colors.primary,
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   commentText: {
//     color: web3Colors.text,
//     fontSize: 16,
//     fontFamily: 'comicNormal',
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   replyView: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   timeText: {
//     color: web3Colors.textSecondary,
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   replyButton: {
//     borderRadius: 12,
//   },
//   replyButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   replyText: {
//     color: web3Colors.text,
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   likeButton: {
//     borderRadius: 12,
//   },
//   likeButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   likeCountText: {
//     color: web3Colors.textSecondary,
//     marginLeft: 4,
//     fontSize: 12,
//   },
//   inputSection: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     paddingTop: 15,
//   },
//   inputContainer: {
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     padding: 16,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//   },
//   textInputContainer: {
//     flex: 1,
//     marginRight: 12,
//   },
//   input: {
//     color: web3Colors.text,
//     fontSize: 16,
//     fontFamily: 'comicintalics',
//     maxHeight: 100,
//     minHeight: 20,
//   },
//   postButtonContainer: {
//     borderRadius: 20,
//   },
//   postButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noCommentContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   noCommentCard: {
//     alignItems: 'center',
//     padding: 40,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   noCommentText: {
//     color: web3Colors.textSecondary,
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   noCommentSubText: {
//     color: web3Colors.textSecondary,
//     fontSize: 14,
//     opacity: 0.7,
//   },
//   replyOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     paddingHorizontal: 20,
//   },
//   replyContainer: {
//     width: '100%',
//     maxWidth: 400,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     elevation: 20,
//     shadowColor: web3Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//   },
//   replyHeader: {
//     padding: 20,
//     paddingBottom: 0,
//   },
//   replyHeaderGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 12,
//   },
//   replyHeaderText: {
//     color: web3Colors.text,
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   replyContent: {
//     padding: 20,
//   },
//   replyingToText: {
//     color: web3Colors.textSecondary,
//     fontSize: 14,
//     fontStyle: 'italic',
//     marginBottom: 16,
//     padding: 12,
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//     borderRadius: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: web3Colors.primary,
//   },
//   replyInputContainer: {
//     marginBottom: 20,
//   },
//   replyInputGradient: {
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     padding: 16,
//   },
//   replyInput: {
//     color: web3Colors.text,
//     fontSize: 16,
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   replyActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   cancelReplyButton: {
//     flex: 1,
//     marginRight: 8,
//     borderRadius: 12,
//   },
//   cancelReplyGradient: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   cancelReplyText: {
//     color: web3Colors.accent,
//     fontWeight: '600',
//   },
//   sendReplyButton: {
//     flex: 1,
//     marginLeft: 8,
//     borderRadius: 12,
//   },
//   sendReplyGradient: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//   },
//   sendReplyText: {
//     color: web3Colors.text,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
// });

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

const CommentModal = ({
  visible,
  onClose,
  postId,
  userId,
  endpoint,
  commentId, // This will be used for fetching replies to a specific comment
}) => {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  // New state for managing expanded replies
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [repliesData, setRepliesData] = useState({});
  const [loadingReplies, setLoadingReplies] = useState(new Set());

  // Determine if we're showing replies to a specific comment or all comments
  const isShowingReplies = !!commentId;

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

  // Fetch all comments for a post
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${enndpoint.main}/api/newsfeed/${postId}/comments`,
      );
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch replies to a specific comment
  const fetchReplyComments = async () => {
    if (!commentId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${enndpoint.main}/api/newsfeed/${postId}/comment/${commentId}/replies`,
      );
       console.log("Replies....", res.data.replies)
      setComments(res.data.replies || []);
    } catch (err) {
      console.error('Error fetching reply comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch replies for a specific comment (for expanding)
  const fetchRepliesForComment = async (commentItemId) => {
    setLoadingReplies(prev => new Set([...prev, commentItemId]));
    try {
      const res = await axios.get(
        `${enndpoint.main}/api/newsfeed/${postId}/comment/${commentItemId}/replies`,
      );

      console.log("Replies....", res.data.replies)
      setRepliesData(prev => ({
        ...prev,
        [commentItemId]: res.data.replies || []
      }));
    } catch (err) {
      console.error('Error fetching replies for comment:', err);
      setRepliesData(prev => ({
        ...prev,
        [commentItemId]: []
      }));
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(commentItemId);
        return newSet;
      });
    }
  };

  // Toggle replies visibility
  const toggleReplies = async (commentItemId, replyCount) => {
    if (expandedComments.has(commentItemId)) {
      // Collapse replies
      setExpandedComments(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(commentItemId);
        return newSet;
      });
    } else {
      // Expand replies
      if (!repliesData[commentItemId] && replyCount > 0) {
        await fetchRepliesForComment(commentItemId);
      }
      setExpandedComments(prev => new Set([...prev, commentItemId]));
    }
  };

  // Post a new comment to the post
  const postComment = async () => {
    if (!commentInput.trim()) return;
    setPosting(true);
    try {
      const response = await axios.post(
        `${enndpoint.main}/api/newsfeed/${postId}/comment`,
        {
          userId,
          comment: commentInput.trim(),
        },
      );
      setCommentInput('');
      
      // Add the new comment to the list immediately for better UX
      if (response.data.comment) {
        setComments(prevComments => [response.data.comment, ...prevComments]);
      } else {
        // Fallback: refetch all comments
        await fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      // Optionally show an error message to the user
    } finally {
      setPosting(false);
    }
  };

  // Post a reply to a specific comment
  const postReplyComment = async (parentCommentId, replyText) => {
    if (!replyText.trim()) return;
    setPostingReply(true);
    try {
      const response = await axios.post(
        `${enndpoint.main}/api/newsfeed/${postId}/comment/${parentCommentId}/reply`,
        {
          userId,
          reply: replyText.trim(),
        },
      );
      
      // Add the new reply to the appropriate replies data
      if (response.data.reply) {
        setRepliesData(prev => ({
          ...prev,
          [parentCommentId]: [response.data.reply, ...(prev[parentCommentId] || [])]
        }));
        
        // Update the parent comment's reply count
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === parentCommentId 
              ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
              : comment
          )
        );
        
        // Ensure the replies are expanded to show the new reply
        setExpandedComments(prev => new Set([...prev, parentCommentId]));
      } else {
        // Fallback: refetch comments/replies
        if (isShowingReplies) {
          await fetchReplyComments();
        } else {
          await fetchComments();
        }
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
      // Optionally show an error message to the user
    } finally {
      setPostingReply(false);
    }
  };

  // Handle liking a comment
  const handleLikeComment = async (commentItemId) => {
    try {
      const response = await axios.post(
        `${enndpoint.main}/api/newsfeed/comment/${commentItemId}/like`,
        { userId }
      );
      
      // Update the comment in the local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentItemId 
            ? { 
                ...comment, 
                likes: response.data.likes || (comment.likes || 0) + (comment.likedByUser ? -1 : 1),
                likedByUser: !comment.likedByUser 
              }
            : comment
        )
      );
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  // Handle liking a reply
  const handleLikeReply = async (replyId, parentCommentId) => {
    try {
      const response = await axios.post(
        `${enndpoint.main}/api/newsfeed/comment/${replyId}/like`,
        { userId }
      );
      
      // Update the reply in the replies data
      setRepliesData(prev => ({
        ...prev,
        [parentCommentId]: prev[parentCommentId]?.map(reply => 
          reply.id === replyId 
            ? { 
                ...reply, 
                likes: response.data.likes || (reply.likes || 0) + (reply.likedByUser ? -1 : 1),
                likedByUser: !reply.likedByUser 
              }
            : reply
        ) || []
      }));
    } catch (err) {
      console.error('Failed to like reply:', err);
    }
  };

  // Fetch data when modal becomes visible
  useEffect(() => {
    if (visible) {
      if (isShowingReplies) {
        fetchReplyComments();
      } else {
        fetchComments();
      }
    }
  }, [visible, commentId]);

  // Render a single reply with connecting line
  const renderReply = (reply, index, totalReplies, parentCommentId) => {
    const isLast = index === totalReplies - 1;
    
    return (
      <View key={reply.id} style={styles.replyContainer}>
        {/* Connecting lines */}
        <View style={styles.replyLineContainer}>
          {/* Vertical line from parent */}
          <View style={[styles.verticalLine, { height: isLast ? 20 : '100%' }]} />
          {/* Horizontal line to reply */}
          <View style={styles.horizontalLine} />
        </View>
        
        {/* Reply content */}
        <View style={styles.replyContent}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
            style={styles.replyCard}
          >
            {reply.username && (
              <Text style={styles.replyUsernameText}>@{reply.username}</Text>
            )}
            
            <Text style={styles.replyText}>
              {reply.reply || reply.replyText || reply.comment || reply.commentText}
            </Text>

            <View style={styles.replyActions}>
              {reply.createdAt && (
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={10} color={web3Colors.textSecondary} />
                  <Text style={styles.replyTimeText}>{getTimeAgo(reply.createdAt)}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.replyLikeButton}
                onPress={() => handleLikeReply(reply.id, parentCommentId)}
              >
                <View style={styles.likeButtonContent}>
                  <Ionicons
                    name={reply.likedByUser ? 'heart' : 'heart-outline'}
                    size={14}
                    color={reply.likedByUser ? web3Colors.accent : web3Colors.textSecondary}
                  />
                  <Text style={styles.replyLikeCount}>{reply.likes || 0}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const replyCount = item.replyCount || 0;
    const isExpanded = expandedComments.has(item.id);
    const replies = repliesData[item.id] || [];
    const isLoadingRepliesForItem = loadingReplies.has(item.id);

    return (
      <View style={styles.commentItem}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.commentCard}
        >
          {/* Display username if available */}
          {item.username && (
            <Text style={styles.usernameText}>@{item.username}</Text>
          )}
          
          <Text style={styles.commentText}>
            {item.comment || item.commentText || item.reply || item.replyText}
          </Text>

          <View style={styles.replyView}>
            {item.createdAt && (
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={web3Colors.textSecondary} />
                <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
              </View>
            )}

            {/* Only show reply button if we're not already showing replies */}
            {!isShowingReplies && (
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
            )}

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleLikeComment(item.id)}
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

        {/* Replies section */}
        {!isShowingReplies && replyCount > 0 && (
          <View style={styles.repliesSection}>
            {/* Show replies count and toggle button */}
            <TouchableOpacity
              style={styles.showRepliesButton}
              onPress={() => toggleReplies(item.id, replyCount)}
              disabled={isLoadingRepliesForItem}
            >
              <View style={styles.showRepliesContent}>
                <View style={styles.replyCountLine} />
                {isLoadingRepliesForItem ? (
                  <ActivityIndicator size="small" color={web3Colors.primary} />
                ) : (
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={web3Colors.primary} 
                  />
                )}
                <Text style={styles.showRepliesText}>
                  {isExpanded ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Show replies when expanded */}
            {isExpanded && replies.length > 0 && (
              <View style={styles.repliesContainer}>
                {replies.map((reply, index) => 
                  renderReply(reply, index, replies.length, item.id)
                )}
              </View>
            )}
          </View>
        )}
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
                      <Text style={styles.headerText}>
                        {isShowingReplies ? 'Replies' : 'Comments'}
                      </Text>
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
                    <Text style={styles.loadingText}>
                      Loading {isShowingReplies ? 'replies' : 'comments'}...
                    </Text>
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
                          <Text style={styles.noCommentText}>
                            No {isShowingReplies ? 'replies' : 'comments'} yet.
                          </Text>
                          <Text style={styles.noCommentSubText}>
                            Be the first to share your thoughts!
                          </Text>
                        </LinearGradient>
                      </View>
                    }
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
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
                        placeholder={isShowingReplies ? "Add a reply..." : "Share your thoughts..."}
                        placeholderTextColor={web3Colors.textSecondary}
                        multiline
                      />
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        if (isShowingReplies) {
                          postReplyComment(commentId, commentInput);
                        } else {
                          postComment();
                        }
                      }}
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

            <View style={styles.replyModalContent}>
              <Text style={styles.replyingToText}>
                "{(replyingToComment?.comment || replyingToComment?.commentText || '').slice(0, 80)}{(replyingToComment?.comment || replyingToComment?.commentText || '').length > 80 ? '...' : ''}"
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
                  />
                </LinearGradient>
              </View>

              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.cancelReplyButton}
                  onPress={() => setReplyModalVisible(false)}
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
                  onPress={async () => {
                    if (!replyInput.trim() || !replyingToComment) return;
                    
                    await postReplyComment(replyingToComment.id, replyInput);
                    setReplyInput('');
                    setReplyModalVisible(false);
                  }}
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

export default CommentModal;

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
  usernameText: {
    color: web3Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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
  
  // New styles for threaded replies
  repliesSection: {
    marginTop: 8,
  },
  showRepliesButton: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  showRepliesContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyCountLine: {
    width: 20,
    height: 1,
    backgroundColor: web3Colors.primary,
    marginRight: 8,
  },
  showRepliesText: {
    color: web3Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  repliesContainer: {
    marginTop: 4,
  },
  replyContainer: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  replyLineContainer: {
    width: 40,
    position: 'relative',
    alignItems: 'center',
  },
  verticalLine: {
    width: 2,
    backgroundColor: web3Colors.border,
    position: 'absolute',
    left: 16,
    top: 0,
  },
  horizontalLine: {
    width: 20,
    height: 2,
    backgroundColor: web3Colors.border,
    position: 'absolute',
    left: 18,
    top: 20,
  },
  replyContent: {
    flex: 1,
    marginLeft: 8,
  },
  replyCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  replyUsernameText: {
    color: web3Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    color: web3Colors.text,
    fontSize: 14,
    fontFamily: 'comicNormal',
    lineHeight: 18,
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyTimeText: {
    color: web3Colors.textSecondary,
    fontSize: 10,
    marginLeft: 4,
  },
  replyLikeButton: {
    borderRadius: 8,
  },
  replyLikeCount: {
    color: web3Colors.textSecondary,
    marginLeft: 2,
    fontSize: 10,
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
  replyModalContent: {
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