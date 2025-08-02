import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import React, { useState, useContext } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { AuthContext } from '../../persistence/AuthContext';
import enndpoint from '../../../constants/enndpoint';

const { width, height } = Dimensions.get('window');


const web3Colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  accent2: '#10b981',
  warning: '#f59e0b',
  background: '#0f0f23',
  surface: '#1a1a2e',
  card: '#16213e',
  text: '#ffffff',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  border: '#374151',
  borderLight: '#4b5563',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(255, 255, 255, 0.05)',
  inputBg: '#1f2937',
  inputBorder: '#374151',
  neon: '#00d4ff',
};

const ProfileDetailsSetup = ({ route, navigation }) => {
  const { walletAddress, walletLabel } = route.params;

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!username || !email) {
      Alert.alert('Error', 'Username and email are required');
      return;
    }

    try {
      const res = await axios.post(
        `${enndpoint.main}/api/users/create-user`,
        {
          username,
          email,
          bio,
          walletAddress,
        }
      );

      if (res.data?.message === 'success' || res.status === 201) {
        const userData = res.data.user;
        await login(userData);
        Alert.alert('Success', 'Profile created');
        navigation.navigate('Home');
      }
    } catch (err) {
      console.log(err);

      let errorMessage = 'Could not create user';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
    
      <LinearGradient
        colors={[web3Colors.background, web3Colors.surface, web3Colors.card]}
        locations={[0, 0.5, 1]}
        style={styles.backgroundGradient}
      />
      
     
      <View style={styles.gridOverlay} />
     
      <View style={styles.contentWrapper}>
        

        <View style={styles.headerSection}>
        
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.setupText}>SETUP YOUR</Text>
              <Text style={styles.profileText}>PROFILE</Text>
              
           
              <LinearGradient
                colors={[web3Colors.accent, web3Colors.neon]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleAccent}
              />
            </View>
            
           
            <Pressable style={styles.walletCard}>
              <LinearGradient
                colors={[web3Colors.warning, web3Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.walletGradient}
              >
                <View style={styles.walletContent}>
                  <Text style={styles.walletLabel}>WALLET</Text>
                  <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
                    {walletAddress}
                  </Text>
                </View>
                
               
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                  style={styles.walletGlow}
                />
              </LinearGradient>
            </Pressable>
          </View>

      
          <View style={styles.logoSection}>
            <View style={styles.logoFrame}>
              <LinearGradient
                colors={[web3Colors.glass, web3Colors.glassDark]}
                style={styles.logoBackground}
              >
                <Image
                  source={require('../../../assets/images/memelogo.png')}
                  style={styles.logoImage}
                />
                
               
                <View style={styles.logoPulse} />
              </LinearGradient>
              
          
              <View style={styles.logoRing} />
            </View>
          </View>
        </View>

        
        <View style={styles.formSection}>
     
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Text style={styles.labelIcon}>👤 </Text>
              USERNAME
            </Text>
            <View style={styles.inputContainer}>
              <LinearGradient
                colors={[web3Colors.glass, web3Colors.glassDark]}
                style={styles.inputBackground}
              >
                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor={web3Colors.textMuted}
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                />
              </LinearGradient>
              
             
              <LinearGradient
                colors={[web3Colors.primary + '40', web3Colors.accent + '40', 'transparent']}
                style={styles.inputBorder}
              />
            </View>
          </View>

      
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Text style={styles.labelIcon}>📧 </Text>
              EMAIL
            </Text>
            <View style={styles.inputContainer}>
              <LinearGradient
                colors={[web3Colors.glass, web3Colors.glassDark]}
                style={styles.inputBackground}
              >
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={web3Colors.textMuted}
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </LinearGradient>
              
              <LinearGradient
                colors={[web3Colors.primary + '40', web3Colors.accent + '40', 'transparent']}
                style={styles.inputBorder}
              />
            </View>
          </View>

    
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Text style={styles.labelIcon}>✨ </Text>
              BIO
              <Text style={styles.optionalText}> (Optional)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <LinearGradient
                colors={[web3Colors.glass, web3Colors.glassDark]}
                style={styles.inputBackground}
              >
                <TextInput
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={web3Colors.textMuted}
                  style={[styles.textInput, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  multiline={true}
                  numberOfLines={3}
                />
              </LinearGradient>
              
              <LinearGradient
                colors={[web3Colors.secondary + '40', web3Colors.accent2 + '40', 'transparent']}
                style={styles.inputBorder}
              />
            </View>
          </View>
        </View>

     
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[web3Colors.primary, web3Colors.secondary, web3Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.continueText}>CONTINUE</Text>
                <View style={styles.buttonArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
              
        
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonShine}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

     
      <View style={styles.floatingElements}>
        {[...Array(8)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.floatingParticle,
              {
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 90 + 5}%`,
                opacity: 0.2 + Math.random() * 0.3,
                transform: [
                  { scale: 0.3 + Math.random() * 0.7 },
                  { rotate: `${Math.random() * 360}deg` }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[
                web3Colors.accent + '60',
                web3Colors.primary + '40',
                'transparent'
              ]}
              style={styles.particleGradient}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfileDetailsSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  

  contentWrapper: {
    flex: 1,
    paddingTop: height * 0.06,
    paddingHorizontal: 20,
  },
  

  headerSection: {
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  titleContainer: {
    flex: 1,
  },
  setupText: {
    fontSize: 22,
    color: web3Colors.textMuted,
    fontFamily: 'comicsansbold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileText: {
    fontSize: 28,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  titleAccent: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
  },
  
  // Wallet Card
  walletCard: {
    flex: 1,
    marginLeft: 15,
    borderRadius: 20,
    elevation: 8,
    shadowColor: web3Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  walletGradient: {
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  walletContent: {
    padding: 12,
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 10,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 11,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    textAlign: 'center',
  },
  walletGlow: {
    position: 'absolute',
    top: 0,
    left: -50,
    right: -50,
    height: 2,
    transform: [{ rotate: '25deg' }],
  },


  logoSection: {
    alignItems: 'center',
  },
  logoFrame: {
    position: 'relative',
  },
  logoBackground: {
    borderRadius: 40,
    padding: 15,
    borderWidth: 1,
    borderColor: web3Colors.borderLight,
    elevation: 12,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  logoImage: {
    width: 100,
    height: 120,
    resizeMode: 'contain',
  },
  logoPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    backgroundColor: web3Colors.primary + '15',
    borderRadius: 70,
    top: -10,
    left: -20,
  },
  logoRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: web3Colors.accent + '30',
    top: -15,
    left: -30,
  },


  formSection: {
   marginBottom:15,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 5,
  },
  labelIcon: {
    fontSize: 16,
  },
  optionalText: {
    fontSize: 12,
    color: web3Colors.textMuted,
    fontFamily: 'comicintalics',
  },
  inputContainer: {
    position: 'relative',
  },
  inputBackground: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: web3Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  textInput: {
    padding: 18,
    fontSize: 16,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    backgroundColor: 'transparent',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },

  
  buttonSection: {
    paddingBottom: 50,
  },
  continueButton: {
    borderRadius: 30,
    elevation: 15,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  buttonGradient: {
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  continueText: {
    fontSize: 18,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    fontWeight: '800',
    letterSpacing: 2,
    marginRight: 12,
  },
  buttonArrow: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: web3Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    height: 3,
    transform: [{ rotate: '25deg' }],
  },


  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  floatingParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  particleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
});