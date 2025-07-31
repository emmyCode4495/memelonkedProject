import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Pressable, Alert, FlatList, Modal, ScrollView, Platform } from 'react-native'
import React, { useState, useContext } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
// import { UserContext } from '../../../context/UserContext';
// import { WalletContext } from '../../../context/WalletContext';
import enndpoint from '../../../constants/enndpoint';
import { AuthContext } from '../../persistence/AuthContext';
import {  HF_TOKEN, HF_API_URL } from '@env';


// Web3 color scheme (extracted from first file)
const web3Colors = {
  primary: '#00D4FF',
  secondary: '#FF6B35',
  background: '#0A0B1E',
  surface: '#1A1B2E',
  text: '#FFFFFF',
  textSecondary: '#A0A3BD',
  border: '#2A2D47',
  glassOverlay: 'rgba(255, 255, 255, 0.1)',
};


const CreateMemePage = () => {
  const [hasSound, setHasSound] = useState(false);
  const [inputText, setInputText] = useState('');
  const [generatedRoast, setGeneratedRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [customSoundUri, setCustomSoundUri] = useState(null);

  const navigation = useNavigation();
  const { user, walletInfo } = useContext(AuthContext) || {};


  // Dynamic user ID mapping function
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

  const handleSelectMedia = () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else {
          const asset = response.assets[0];
          setMediaUri(asset.uri);
          setMediaType(asset.type?.startsWith('video') ? 'video' : 'image');
        }
      }
    );
  };

  const handleSelectCustomSound = () => {
    const options = {
      mediaType: 'mixed',
      selectionLimit: 1,
      includeBase64: false,
      quality: 1,
    };

    // Add platform-specific options for better audio access
    if (Platform.OS === 'ios') {
      options.mediaTypes = 'All'; // Allows access to all media types including audio
    }

    launchImageLibrary(
      options,
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled sound picker');
        } else if (response.errorCode) {
          console.error('Audio Picker Error: ', response.errorMessage);
          Alert.alert('Error', 'Failed to select audio file');
        } else {
          const asset = response.assets[0];
          
          // Check if it's an audio file or if we can't determine the type
          const isAudioFile = asset.type?.startsWith('audio') || 
                             asset.fileName?.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i);
          
          if (isAudioFile || !asset.type) {
            // If type is undefined, assume it might be audio and let the user try
            setCustomSoundUri(asset.uri);
            setSelectedSound({
              id: 'custom',
              name: asset.fileName || 'Custom Audio',
              duration: 'Custom',
              url: asset.uri
            });
            setShowSoundPicker(false);
          } else {
            Alert.alert(
              'Invalid File Type', 
              'Please select an audio file (MP3, WAV, M4A, AAC, etc.)',
              [
                { text: 'Try Again', onPress: () => handleSelectCustomSound() },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }
      }
    );
  };

  const generateRoast = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setGeneratedRoast('');

    const fallbackRoasts = [
      `${inputText}? More like ${inputText.toLowerCase()}-n't! 🔥`,
      `I've seen more personality in a wet napkin than in ${inputText}! 😂`,
      `${inputText} called, they want their mediocrity back! 💀`,
      `I'd roast ${inputText}, but I don't think they could handle the heat! 🌶️`,
      `${inputText} is like a software update - nobody asked for it! 📱`,
    ];

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          inputs: `Create a funny roast about ${inputText}:`,
          parameters: {
            max_length: 60,
            temperature: 0.9,
            repetition_penalty: 1.2,
          }
        },
        {
          headers: {
            Authorization: {HF_TOKEN}
          },
          timeout: 30000
        }
      );

      let roastText = '';
      if (Array.isArray(response.data)) {
        roastText = response.data[0]?.generated_text || '';
      } else if (response.data?.generated_text) {
        roastText = response.data.generated_text;
      }

      if (roastText) {
        roastText = roastText.replace(`Create a funny roast about ${inputText}:`, '').trim();
        const sentences = roastText.split(/[.!?]+/);
        if (sentences.length > 0) {
          roastText = sentences[0].trim();
          if (!roastText.endsWith('.') && !roastText.endsWith('!')) {
            roastText += '!';
          }
        }
      }

      const finalRoast = roastText || fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
      setGeneratedRoast(finalRoast);
      setInputText(finalRoast); // Replace the input text with generated roast

    } catch (error) {
      console.error('API Error:', error);
      const finalRoast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
      setGeneratedRoast(finalRoast);
      setInputText(finalRoast); // Replace the input text with generated roast
    } finally {
      setLoading(false);
    }
  };

  const postMeme = async () => {
    if (!inputText.trim() || !mediaUri) {
      Alert.alert('Missing Content', 'Please add media and generate a roast first!');
      return;
    }

    setPosting(true);

    try {
      // Prepare media items array
      const mediaItems = [{
        url: mediaUri, // In real app, this would be uploaded to cloud storage first
        type: mediaType
      }];

    
      // Prepare meme data according to backend requirements
      const memeData = {
        userId: getValidUserId(user, walletInfo),
        memeText: inputText, // Use the text from input box (which now contains the generated roast)
        mediaItems: mediaItems
      };

      console.log("Sent detaiils: ",memeData)
      // Replace with your actual backend endpoint
      const response = await axios.post(`${enndpoint.main}/api/memes/create`, memeData);

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          'Success! 🎉', 
          'Your epic roast has been posted!', 
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Post Error:', error);
      Alert.alert('Error', 'Failed to post meme. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const renderSoundItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.soundItem,
        selectedSound?.id === item.id && styles.soundItemSelected
      ]}
      onPress={() => {
        setSelectedSound(item);
        setShowSoundPicker(false);
      }}
    >
      <LinearGradient
        colors={selectedSound?.id === item.id 
          ? [web3Colors.primary, web3Colors.secondary] 
          : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
        }
        style={styles.soundItemGradient}
      >
        <View style={styles.soundItemContent}>
          <Ionicons 
            name="musical-notes" 
            size={20} 
            color={selectedSound?.id === item.id ? 'white' : web3Colors.primary} 
          />
          <View style={styles.soundItemText}>
            <Text style={[
              styles.soundItemName,
              selectedSound?.id === item.id && styles.soundItemNameSelected
            ]}>
              {item.name}
            </Text>
            <Text style={[
              styles.soundItemDuration,
              selectedSound?.id === item.id && styles.soundItemDurationSelected
            ]}>
              {item.duration}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0A0B1E', '#1A1B2E', '#0A0B1E']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => { navigation.goBack() }}
          >
            <LinearGradient
              colors={['rgba(0, 212, 255, 0.2)', 'rgba(255, 107, 53, 0.2)']}
              style={styles.backButtonGradient}
            >
              <Ionicons name='chevron-back' size={24} color={web3Colors.text} />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Meme</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
      </View>

      {/* Media Picker */}
      <View style={styles.mediaSection}>
        <View style={styles.mediaCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.mediaCardGradient}
          >
            <TouchableOpacity onPress={handleSelectMedia} style={styles.mediaBox}>
              {mediaUri ? (
                <View style={styles.mediaContainer}>
                  {mediaType === 'video' ? (
                    <Video
                      source={{ uri: mediaUri }}
                      style={styles.media}
                      controls
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: mediaUri }}
                      style={styles.media}
                      resizeMode="cover"
                    />
                  )}
                  <LinearGradient
                    colors={['rgba(0, 212, 255, 0.3)', 'rgba(255, 107, 53, 0.3)']}
                    style={styles.mediaOverlay}
                  />
                </View>
              ) : (
                <View style={styles.placeholderContent}>
                  <LinearGradient
                    colors={['rgba(0, 212, 255, 0.2)', 'rgba(255, 107, 53, 0.2)']}
                    style={styles.placeholderIcon}
                  >
                    <Ionicons name="image-outline" size={40} color={web3Colors.primary} />
                  </LinearGradient>
                  <Text style={styles.placeholderText}>Tap to select image or video</Text>
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* Text Input */}
      <View style={styles.inputSection}>
        <View style={styles.inputCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.inputCardGradient}
          >
            <TextInput
              style={styles.textInput}
              placeholder='Let the roast out...'
              placeholderTextColor={web3Colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </LinearGradient>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

   
    

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.cancelButtonGradient}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roastButton}
          onPress={generatedRoast ? postMeme : generateRoast}
          disabled={loading || posting}
        >
          <LinearGradient
            colors={[web3Colors.primary, web3Colors.secondary]}
            style={styles.roastButtonGradient}
          >
            <Text style={styles.roastButtonText}>
              {posting ? 'Posting...' : loading ? 'Roasting...' : generatedRoast ? 'Post Meme 🚀' : 'Roast Me 🔥'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {(loading || posting) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={web3Colors.primary} />
          <Text style={styles.loadingText}>
            {posting ? 'Posting your epic meme...' : 'Generating epic roast...'}
          </Text>
        </View>
      )}

      {/* Result Display (Optional - since text is now in input) */}
      {generatedRoast && (
        <View style={styles.resultSection}>
          <View style={styles.resultCard}>
            <LinearGradient
              colors={['rgba(0, 212, 255, 0.1)', 'rgba(255, 107, 53, 0.1)']}
              style={styles.resultCardGradient}
            >
              <Text style={styles.resultLabel}>Generated Roast (you can edit above):</Text>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Sound Picker Modal */}
      <Modal
        visible={showSoundPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSoundPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['rgba(26, 27, 46, 0.95)', 'rgba(10, 11, 30, 0.95)']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Sound Effect</Text>
                <TouchableOpacity
                  onPress={() => setShowSoundPicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={web3Colors.text} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={SAMPLE_SOUNDS}
                renderItem={renderSoundItem}
                keyExtractor={(item) => item.id}
                style={styles.soundList}
                showsVerticalScrollIndicator={false}
              />

              <TouchableOpacity
                style={styles.customSoundButton}
                onPress={handleSelectCustomSound}
              >
                <LinearGradient
                  colors={['rgba(0, 212, 255, 0.2)', 'rgba(255, 107, 53, 0.2)']}
                  style={styles.customSoundButtonGradient}
                >
                  <Ionicons name="musical-note" size={20} color={web3Colors.primary} />
                  <Text style={styles.customSoundButtonText}>Select Audio File</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

export default CreateMemePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: web3Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'comicsansbold',
  },
  headerRight: {
    width: 40,
  },
  mediaSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  mediaCard: {
    borderRadius: 24,
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mediaCardGradient: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: web3Colors.border,
    padding: 20,
  },
  mediaBox: {
    height: 286,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: web3Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  inputSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  inputCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  inputCardGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    padding: 20,
    minHeight: 80,
  },
  textInput: {
    color: web3Colors.text,
    fontSize: 16,
    fontFamily: 'comicintalics',
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: web3Colors.border,
    marginHorizontal: 20,
    marginTop: 30,
  },
  optionsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionLabel: {
    fontSize: 16,
    color: web3Colors.text,
    fontWeight: '500',
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: web3Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: web3Colors.secondary,
  },
  radioButtonInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  soundSection: {
    marginTop: 15,
  },
  soundSelector: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  soundSelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  soundSelectorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: web3Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 16,
    elevation: 4,
    shadowColor: web3Colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  cancelButtonText: {
    color: web3Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  roastButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 16,
    elevation: 6,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  roastButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  roastButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    color: web3Colors.textSecondary,
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  resultSection: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  resultCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: web3Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  resultCardGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
  },
  modalGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: web3Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: web3Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  soundList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  soundItem: {
    marginBottom: 12,
    borderRadius: 12,
  },
  soundItemSelected: {
    elevation: 6,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  soundItemGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  soundItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  soundItemText: {
    flex: 1,
    marginLeft: 12,
  },
  soundItemName: {
    fontSize: 16,
    color: web3Colors.text,
    fontWeight: '500',
  },
  soundItemNameSelected: {
    color: 'white',
  },
  soundItemDuration: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginTop: 2,
  },
  soundItemDurationSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  customSoundButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  customSoundButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  customSoundButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: web3Colors.primary,
    fontWeight: '500',
  },
});