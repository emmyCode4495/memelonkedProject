import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from 'react-native';
import colors from '../../../constants/colors';
import { useConnection } from '../providers/ConnectionProvider';
import ConnectButton from './ConnectButton';
import DisconnectWallet from './DisconnectWallet';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../persistence/AuthContext';
import axios from 'axios';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import enndpoint from '../../../constants/enndpoint';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');


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
  glassBorder: 'rgba(255, 255, 255, 0.15)',
};

const WalletConnectScreen = () => {
  const [authorization, setAuthorization] = useState(null);
  const [userPublicKey, setUserPublicKey] = useState(null); 
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [glowAnim] = useState(new Animated.Value(0));
  
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const { connection } = useConnection();


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

 
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, [fadeAnim, scaleAnim, glowAnim]);

  const handleWalletConnect = (auth) => {
    console.log('Wallet connected:', auth);
    console.log('Raw auth object:', JSON.stringify(auth, null, 2));
    setAuthorization(auth);
    
    
    if (auth?.address) {
      try {
        console.log('Raw address from auth:', auth.address);
        console.log('Address type:', typeof auth.address);
        console.log('Address length:', auth.address.length);
        
        let publicKey;
        let cleanAddress = auth.address.trim();
        
       
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanAddress) && cleanAddress.includes('=')) {
          console.log('Address appears to be Base64, converting...');
          try {
            const binaryString = atob(cleanAddress);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            publicKey = new PublicKey(bytes);
            console.log('Successfully converted Base64 to PublicKey:', publicKey.toBase58());
          } catch (base64Error) {
            console.log('Base64 conversion failed:', base64Error);
            throw new Error('Failed to convert Base64 address');
          }
        }
        else if (cleanAddress instanceof Uint8Array || Buffer.isBuffer(cleanAddress)) {
          console.log('Address is Uint8Array/Buffer, converting...');
          publicKey = new PublicKey(cleanAddress);
        } 
        else if (Array.isArray(cleanAddress)) {
          console.log('Address is Array, converting...');
          publicKey = new PublicKey(new Uint8Array(cleanAddress));
        }
        else if (typeof cleanAddress === 'string') {
          if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(cleanAddress) && cleanAddress.length >= 32 && cleanAddress.length <= 44) {
            console.log('Address appears to be valid Base58');
            publicKey = new PublicKey(cleanAddress);
          } else {
            throw new Error('Address format not recognized');
          }
        }
        else {
          throw new Error('Unsupported address format');
        }
        
        setUserPublicKey(publicKey);
        console.log('Public key set successfully:', publicKey.toBase58());
        
      } catch (error) {
        console.log('Invalid public key error:', error);
        console.log('Address that caused error:', auth.address);
        
        let errorMessage = 'Invalid wallet address format';
        if (error.message.includes('Non-base58')) {
          errorMessage = 'Wallet address format is not supported. Please try a different wallet.';
        } else if (error.message.includes('Base64')) {
          errorMessage = 'Failed to process wallet address. Please try reconnecting.';
        }
        
        Alert.alert('Wallet Connection Error', errorMessage);
        setUserPublicKey(null);
      }
    }
  };

  const handleContinue = async () => {
    if (!authorization) {
      Alert.alert('Wallet Required', 'Please connect your wallet to continue your Web3 journey! 🚀');
      return;
    }

    let walletAddress = null;

    try {
      console.log('Continue button clicked, authorization:', authorization);
      
      walletAddress = authorization.address;
      let cleanAddress = walletAddress.trim();
      
     
      if (/^[A-Za-z0-9+/]+={0,2}$/.test(cleanAddress) && cleanAddress.includes('=')) {
        console.log('Converting Base64 address for API call...');
        try {
          const binaryString = atob(cleanAddress);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          walletAddress = new PublicKey(bytes).toBase58();
        } catch (conversionError) {
          console.log('Base64 conversion failed in continue:', conversionError);
          throw new Error('Failed to process wallet address');
        }
      } else if (walletAddress instanceof Uint8Array || Buffer.isBuffer(walletAddress)) {
        walletAddress = new PublicKey(walletAddress).toBase58();
      } else if (Array.isArray(walletAddress)) {
        walletAddress = new PublicKey(new Uint8Array(walletAddress)).toBase58();
      }
      
      console.log('Using wallet address for API:', walletAddress);
     
      const requestUrl = `${enndpoint.main}/api/users?wallet=${walletAddress}`;
      console.log("Attempting to connect to:", requestUrl);
      
      const res = await axios.get(requestUrl);
      console.log('API Response:', res.data);

      if (res.data?.user) {
        console.log('User found, logging in');
        login(res.data.user);
      } else {
        console.log('User not found, navigating to setup');
        navigation.navigate('usersetup', {
          walletAddress: walletAddress,
          walletLabel: authorization.label,
        });
      }
    } catch (error) {
      console.log("Continue button error:", error);
      console.log("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        console.log('404 - User not found, navigating to setup with address:', walletAddress);
        navigation.navigate('usersetup', {
          walletAddress: walletAddress,
          walletLabel: authorization.label,
        });
        return;
      }
      
      let errorMessage = 'Failed to check wallet. Please try again.';
      if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Connection Error', errorMessage);
    }
  };

  const handleDisconnect = () => {
    console.log('Disconnecting wallet');
    setAuthorization(null);
    setUserPublicKey(null);
  };

  const WalletAddress = ({ address, style }) => (
    <View style={[styles.walletAddressContainer, style]}>
      <MaterialCommunityIcons name="wallet" size={16} color={web3Colors.accent} />
      <Text style={styles.walletAddressText}>
        {address ? `${address.slice(0, 6)}...${address.slice(-6)}` : 'No address'}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[web3Colors.background, '#1A1B3A', web3Colors.background]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{}} showsVerticalScrollIndicator={false}>
   
        <Animated.View
          style={[
            styles.backgroundOrb1,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundOrb2,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
            },
          ]}
        />

       
        <LinearGradient
          colors={['rgba(148, 69, 255, 0.1)', 'transparent']}
          style={styles.topBar}
        >
          <TouchableOpacity
            onPress={handleContinue} 
            disabled={!authorization}
            style={[
              styles.continueButton,
              !authorization && styles.continueButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={authorization 
                ? [web3Colors.gradient1, web3Colors.gradient2] 
                : [web3Colors.border, web3Colors.border]
              }
              style={styles.continueButtonGradient}
            >
              <Ionicons 
                name="arrow-forward" 
                size={18} 
                color="white" 
                style={{ marginRight: 8 }} 
              />
              <Text style={styles.continueText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          
          <View style={styles.heroSection}>          
            <Text style={styles.subtitleText}>
              Enter the decentralized future with your Solana wallet
            </Text>

           
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[web3Colors.gradient1, web3Colors.gradient2]}
                style={styles.iconGradientBorder}
              >
                <View style={styles.iconBackground}>
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      }],
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/solanaicon.png')}
                      style={styles.solanaIcon}
                    />
                  </Animated.View>
                </View>
              </LinearGradient>
            </View>

           
            <View style={styles.featuresContainer}>
              {[
                { icon: 'lightning-bolt', text: 'Lightning Fast Transactions' },
                { icon: 'shield-check', text: 'Secure & Decentralized' },
                { icon: 'coins', text: 'Multi-Token Support' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons 
                    name={feature.icon} 
                    size={16} 
                    color={web3Colors.secondary} 
                  />
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </View>

      
          <View style={styles.connectionSection}>
            {authorization === null ? (
              <View style={styles.connectSection}>
                <ConnectButton onConnect={handleWalletConnect} />
                
            
                <View style={styles.helpSection}>
                  <Text style={styles.helpText}>
                    New to Solana? Get started with:
                  </Text>
                  <View style={styles.walletOptions}>
                    {['Phantom', 'Solflare', 'Glow'].map((wallet, index) => (
                      <View key={index} style={styles.walletOption}>
                        <Text style={styles.walletOptionText}>{wallet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.connectedContainer}>
            
                <LinearGradient
                  colors={[web3Colors.cardBg, 'rgba(148, 69, 255, 0.1)']}
                  style={styles.walletStatusCard}
                >
                  <LinearGradient
                    colors={[web3Colors.success, web3Colors.secondary]}
                    style={styles.statusHeader}
                  >
                    <MaterialCommunityIcons name="check-circle" size={28} color="white" />
                    <Text style={styles.statusHeaderText}>Wallet Connected</Text>
                  </LinearGradient>

                
                  <View style={styles.walletDetails}>
                    <View style={styles.statusIndicatorContainer}>
                      <View style={styles.statusIndicator} />
                      <Text style={styles.statusText}>Connected to Solana Mainnet</Text>
                    </View>

                    <View style={styles.walletInfoSection}>
                      <Text style={styles.walletLabel}>Wallet Address:</Text>
                      <WalletAddress 
                        address={userPublicKey?.toBase58()} 
                        style={styles.connectedWalletAddress} 
                      />
                      
                      <Text style={styles.walletProvider}>
                        Connected via {authorization.label || 'Unknown Wallet'}
                      </Text>

                 
                      <Text style={styles.connectionTime}>
                        Connected at {new Date().toLocaleTimeString()}
                      </Text>
                    </View>

                  
                    <View style={styles.networkInfo}>
                      <MaterialCommunityIcons name="earth" size={16} color={web3Colors.secondary} />
                      <Text style={styles.networkText}>Solana Mainnet Beta</Text>
                    </View>
                  </View>
                </LinearGradient>

               
                <View style={styles.disconnectSection}>
                  <DisconnectWallet
                    authorization={authorization}
                    onDisconnect={handleDisconnect}
                  />
                  
                  <Text style={styles.disclaimerText}>
                    🔐 Your wallet remains secure and under your control
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  
  backgroundOrb1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: web3Colors.gradient1,
  },
  backgroundOrb2: {
    position: 'absolute',
    bottom: height * 0.1,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: web3Colors.gradient2,
  },

  // Top Bar
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    alignItems: 'flex-end',
  },
  continueButton: {
    borderRadius: 25,
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  subtitleText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },

  // Icon Container
  iconContainer: {
    marginBottom: 30,
  },
  iconGradientBorder: {
    padding: 4,
    borderRadius: 80,
  },
  iconBackground: {
    backgroundColor: web3Colors.cardBg,
    borderRadius: 76,
    padding: 20,
    borderWidth: 1,
    borderColor: web3Colors.glassBorder,
  },
  solanaIcon: {
    width: 120,
    height: 120,
  },

  // Features
  featuresContainer: {
    alignItems: 'center',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    fontWeight: '500',
  },

  // Connection Section
  connectionSection: {
    marginTop: 50,
    justifyContent: 'center',
  },
  connectSection: {
    alignItems: 'center',
  },

  // Help Section
  helpSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    marginBottom: 12,
  },
  walletOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletOption: {
    backgroundColor: web3Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletOptionText: {
    fontSize: 12,
    color: web3Colors.text,
    fontWeight: '600',
  },

  // Connected Container
  connectedContainer: {
    alignItems: 'center',
    width: '100%',
  },

  // Wallet Status Card (replacing balance card)
  walletStatusCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  statusHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },

  // Wallet Details
  walletDetails: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: web3Colors.success,
  },
  statusText: {
    fontSize: 14,
    color: web3Colors.success,
    fontWeight: '600',
  },

  // Wallet Info Section
  walletInfoSection: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  walletLabel: {
    fontSize: 14,
    color: web3Colors.textSecondary,
    textAlign: 'center',
  },
  walletProvider: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  connectionTime: {
    fontSize: 10,
    color: web3Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Network Info
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: web3Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  networkText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    fontWeight: '600',
  },

  // Wallet Address Components
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: web3Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  connectedWalletAddress: {
    backgroundColor: 'rgba(148, 69, 255, 0.2)',
    borderWidth: 1,
    borderColor: web3Colors.primary,
  },
  walletAddressText: {
    fontSize: 12,
    color: web3Colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },

  // Disconnect Section
  disconnectSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default WalletConnectScreen;