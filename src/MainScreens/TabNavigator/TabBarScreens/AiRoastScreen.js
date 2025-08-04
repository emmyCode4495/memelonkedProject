import { 
  Image, 
  Pressable, 
  StyleSheet, 
  Text, 
  View,
  Dimensions,
  StatusBar
} from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

const { width, height } = Dimensions.get('window')

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
  neonGlow: 'rgba(148, 69, 255, 0.4)',
}

const AiRoastScreen = () => {
  const navigation = useNavigation()
  
  return (
    <LinearGradient
      colors={[web3Colors.background, '#1A1B3A', '#0F1419', web3Colors.background]}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Main Content Card */}
      <View style={styles.mainCard}>
        <LinearGradient
          colors={[
            'rgba(148, 69, 255, 0.1)',
            'rgba(0, 212, 255, 0.05)',
            'rgba(255, 107, 107, 0.05)'
          ]}
          style={styles.cardGradient}
        >
          {/* Glow Effect for Doge */}
          <View style={styles.dogeContainer}>
            <LinearGradient
              colors={[
                web3Colors.neonGlow,
                'transparent',
                web3Colors.neonGlow
              ]}
              style={styles.dogeGlow}
            >
              <Image
                source={require('../../../../assets/images/doge.png')}
                style={styles.dogeImage}
              />
            </LinearGradient>
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.mainText}>
              Told <Text style={styles.highlightText}>bonk AI</Text> 'think big' — now it generates my
            </Text>
            <Text style={styles.subText}>
              <Text style={styles.neonText}>delusions</Text> too!
            </Text>
          </View>

          {/* Floating Elements */}
          <View style={styles.floatingElement1}>
            <LinearGradient
              colors={[web3Colors.gradient1, web3Colors.gradient2]}
              style={styles.floatingGradient}
            >
              <MaterialIcons name="psychology" size={16} color="white" />
            </LinearGradient>
          </View>
          
          <View style={styles.floatingElement2}>
            <LinearGradient
              colors={[web3Colors.gradient2, web3Colors.gradient3]}
              style={styles.floatingGradient}
            >
              <Ionicons name="sparkles" size={14} color="white" />
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        {/* Upgrade Banner */}
        <LinearGradient
          colors={[web3Colors.gradient1, web3Colors.gradient2]}
          style={styles.upgradeBanner}
        >
          <View style={styles.upgradeContent}>
            <MaterialIcons name="rocket-launch" size={16} color="white" />
            <Text style={styles.upgradeText}>
              Subscribe to our faster AI model on our Pro-Plan
            </Text>
            <Pressable style={styles.upgradeButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>UPGRADE PLAN</Text>
                <Ionicons name="arrow-forward" size={14} color="white" />
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Input Card */}
        <Pressable 
          style={styles.inputCard}
          onPress={() => navigation.navigate('creatememe')}
        >
          <LinearGradient
            colors={[web3Colors.cardBg, 'rgba(148, 69, 255, 0.05)']}
            style={styles.inputCardGradient}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <LinearGradient
                colors={[web3Colors.gradient1, web3Colors.gradient2]}
                style={styles.avatarGlow}
              >
                <Image
                  source={require('../../../../assets/images/doge.png')}
                  style={styles.avatarImage}
                />
              </LinearGradient>
            </View>

            {/* Input Content */}
            <View style={styles.inputContent}>
              <Text style={styles.placeholderText}>
                Tell me your crazy idea.......
              </Text>
              <View style={styles.inputActions}>
                <View style={styles.actionIcons}>
                  <Ionicons name="mic" size={20} color={web3Colors.textSecondary} />
                  <MaterialIcons name="auto-awesome" size={20} color={web3Colors.primary} />
                </View>
                <LinearGradient
                  colors={[web3Colors.gradient2, web3Colors.gradient3]}
                  style={styles.sendButton}
                >
                  <Ionicons name="send" size={16} color="white" />
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      
    </LinearGradient>
  )
}

export default AiRoastScreen

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
    backgroundColor: web3Colors.glassOverlay,
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
    backgroundColor: web3Colors.glassOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 24,
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
    minHeight: 320,
    position: 'relative',
  },
  dogeContainer: {
    marginBottom: 30,
  },
  dogeGlow: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  dogeImage: {
    width: 152,
    height: 152,
    borderRadius: 76,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainText: {
    fontSize: 18,
    color: web3Colors.text,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'comicintalics',
  },
  highlightText: {
    color: web3Colors.primary,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginTop: 8,
    fontFamily: 'comicsansbold',
  },
  neonText: {
    color: web3Colors.secondary,
    textShadowColor: web3Colors.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  floatingElement1: {
    position: 'absolute',
    top: 40,
    right: 30,
  },
  floatingElement2: {
    position: 'absolute',
    top: 80,
    left: 20,
  },
  floatingGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    marginHorizontal: 20,
    marginTop: 40,
  },
  upgradeBanner: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  upgradeText: {
    flex: 1,
    fontSize: 12,
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  upgradeButton: {
    marginLeft: 10,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 4,
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
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
    minHeight: 80,
  },
  avatarSection: {
    marginRight: 16,
  },
  avatarGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  inputContent: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    marginBottom: 12,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: web3Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  bottomStats: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: web3Colors.border,
    marginHorizontal: 10,
  },
});