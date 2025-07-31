import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

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
  neon: '#00d4ff',
};

const Welcome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
    
      <LinearGradient
        colors={[web3Colors.background, web3Colors.surface, web3Colors.card, web3Colors.background]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.backgroundGradient}
      />
      
  
      <View style={styles.gridOverlay} />
      
   
      <View style={styles.contentWrapper}>
        
    
        <View style={styles.topSection}>
          <View style={styles.logoWrapper}>
       
            <View style={styles.logoFrame}>
              <LinearGradient
                colors={[web3Colors.glass, web3Colors.glassDark]}
                style={styles.logoBackground}
              >
                <View style={styles.logoContent}>
                  <Image
                    source={require('../../assets/images/memelogo.png')}
                    style={styles.logo}
                  />
            
                  <View style={styles.logoPulse} />
                </View>
              </LinearGradient>
              
           
              <View style={styles.logoRing} />
            </View>
            
           
            <View style={styles.brandSection}>
              <View style={styles.brandCard}>
                <LinearGradient
                  colors={[web3Colors.primary, web3Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.brandGradient}
                >
                  <Text style={styles.brandName}>MEMELONKED</Text>
                </LinearGradient>
              </View>
              
              
              <LinearGradient
                colors={[web3Colors.accent, web3Colors.neon]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.brandAccent}
              />
            </View>
          </View>
        </View>

        
        <View style={styles.middleSection}>
       
          <View style={styles.showcaseCard}>
            <LinearGradient
              colors={[web3Colors.glass, web3Colors.glassDark]}
              style={styles.showcaseBackground}
            >
              <View style={styles.showcaseContent}>
           
                <View style={styles.showcaseHeader}>
                  <Text style={styles.showcaseTitle}>THE ULTIMATE</Text>
                  <LinearGradient
                    colors={[web3Colors.warning, web3Colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.titleUnderline}
                  />
                </View>
                
          
                <Text style={styles.playgroundText}>PLAYGROUND</Text>
                
               
                <View style={styles.actionsGrid}>
                  <View style={styles.actionCard}>
                    <LinearGradient
                      colors={[web3Colors.accent + '30', 'transparent']}
                      style={styles.actionBackground}
                    />
                    <Text style={styles.roastText}>ROAST</Text>
                  </View>
                  
                  <View style={styles.actionDivider}>
                    <Text style={styles.dividerText}>&</Text>
                  </View>
                  
                  <View style={styles.actionCard}>
                    <LinearGradient
                      colors={[web3Colors.accent2 + '30', 'transparent']}
                      style={styles.actionBackground}
                    />
                    <Text style={styles.earnText}>EARN</Text>
                  </View>
                </View>
              </View>
              
            
              <LinearGradient
                colors={[web3Colors.primary + '60', web3Colors.secondary + '40', 'transparent']}
                style={styles.showcaseBorder}
              />
            </LinearGradient>
          </View>

        
          <View style={styles.visualSection}>
            <View style={styles.visualContainer}>
              <LinearGradient
                colors={[
                  'transparent',
                  web3Colors.primary + '15',
                  web3Colors.secondary + '15',
                  'transparent'
                ]}
                style={styles.visualGlow}
              />
              
        
              <View style={styles.dashboardContainer}>
              
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={[web3Colors.accent + '20', 'transparent']}
                      style={styles.statBackground}
                    />
                    <Text style={styles.statValue}>BONK FEED</Text>
                    <Text style={styles.statLabel}>ROASTS</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={[web3Colors.accent2 + '20', 'transparent']}
                      style={styles.statBackground}
                    />
                    <Text style={styles.statValue}>CREATE REELS</Text>
                    <Text style={styles.statLabel}>EARN BONK</Text>
                  </View>
                </View>
            
                <View style={styles.activityGraph}>
                  <LinearGradient
                    colors={[web3Colors.glass, web3Colors.glassDark]}
                    style={styles.graphBackground}
                  />
                 
                  <View style={styles.graphBars}>
                    {[0.4, 0.7, 0.3, 0.8, 0.6, 0.9, 0.5].map((height, index) => (
                      <View key={index} style={styles.graphBarContainer}>
                        <LinearGradient
                          colors={[web3Colors.primary, web3Colors.accent]}
                          style={[styles.graphBar, { height: `${height * 100}%` }]}
                        />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.graphLabel}>WEEKLY ACTIVITY</Text>
                </View>
                
               
                <View style={styles.quickActions}>
                  <View style={styles.actionButton}>
                    <LinearGradient
                      colors={[web3Colors.warning + '30', 'transparent']}
                      style={styles.actionBg}
                    />
                    <Text style={styles.actionIcon}>🔥</Text>
                  </View>
                  
                  <View style={styles.actionButton}>
                    <LinearGradient
                      colors={[web3Colors.accent2 + '30', 'transparent']}
                      style={styles.actionBg}
                    />
                    <Text style={styles.actionIcon}>💎</Text>
                  </View>
                  
                  <View style={styles.actionButton}>
                    <LinearGradient
                      colors={[web3Colors.accent + '30', 'transparent']}
                      style={styles.actionBg}
                    />
                    <Text style={styles.actionIcon}>⚡</Text>
                  </View>
                </View>
              </View>
           
              <LinearGradient
                colors={[
                  web3Colors.neon + '10',
                  'transparent',
                  web3Colors.accent + '10'
                ]}
                style={styles.hologramEffect}
              />
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
        
          <View style={styles.systemStatus}>
            <View style={styles.statusIndicators}>
              {[...Array(4)].map((_, index) => (
                <View key={index} style={styles.statusIndicator}>
                  <LinearGradient
                    colors={[web3Colors.accent, web3Colors.accent2]}
                    style={styles.indicatorGradient}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.statusText}>System Ready</Text>
          </View>

         
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('connect')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[web3Colors.primary, web3Colors.secondary, web3Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContainer}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonLabel}>GET STARTED</Text>
                  <View style={styles.buttonIcon}>
                    <Text style={styles.iconText}>▶</Text>
                  </View>
                </View>
                
              
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonShine}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

   
          <View style={styles.connectionInfo}>
            <View style={styles.connectionIndicator} />
            <Text style={styles.connectionLabel}>Ready to Connect Web3</Text>
          </View>
        </View>
      </View>

      <View style={styles.ambientEffects}>
      
        {[...Array(12)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.floatingParticle,
              {
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 90 + 5}%`,
                opacity: 0.3 + Math.random() * 0.4,
                transform: [
                  { scale: 0.4 + Math.random() * 0.8 },
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

        {/* Neural network lines */}
        <View style={styles.neuralNetwork}>
          <LinearGradient
            colors={[
              'transparent',
              web3Colors.accent + '30',
              'transparent'
            ]}
            style={styles.neuralLine1}
          />
          <LinearGradient
            colors={[
              'transparent',
              web3Colors.primary + '30',
              'transparent'
            ]}
            style={styles.neuralLine2}
          />
          <LinearGradient
            colors={[
              'transparent',
              web3Colors.secondary + '30',
              'transparent'
            ]}
            style={styles.neuralLine3}
          />
        </View>
      </View>
    </View>
  );
};

export default Welcome;

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
    opacity: 0.08,
    backgroundColor: 'transparent',
  },
  

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: 30,
  },
  
 
  topSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoFrame: {
    position: 'relative',
    marginBottom: 25,
  },
  logoBackground: {
    borderRadius: 50,
    padding: 18,
    borderWidth: 1,
    borderColor: web3Colors.borderLight,
    elevation: 15,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  logoContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
  },
  logoPulse: {
    position: 'absolute',
    width: 90,
    height: 90,
    backgroundColor: web3Colors.primary + '15',
    borderRadius: 45,
    top: -12.5,
    left: -12.5,
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: web3Colors.accent + '30',
    top: -15,
    left: -15,
  },
  
  // Brand Section
  brandSection: {
    alignItems: 'center',
  },
  brandCard: {
    marginBottom: 8,
  },
  brandGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 18,
  },
  brandName: {
    fontSize: 22,
    fontFamily: 'comicItalicsbold',
    fontWeight: '900',
    letterSpacing: 2.5,
    color: web3Colors.text,
    textShadowColor: web3Colors.primary + '80',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandAccent: {
    width: 80,
    height: 3,
    borderRadius: 1.5,
  },

  middleSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  showcaseCard: {
    marginBottom: 30,
  },
  showcaseBackground: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: web3Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  showcaseContent: {
    padding: 32,
    alignItems: 'center',
  },
  showcaseHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  showcaseTitle: {
    fontSize: 14,
    color: web3Colors.textMuted,
    fontFamily: 'comicintalics',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  titleUnderline: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
  playgroundText: {
    fontSize: 36,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    fontWeight: '900',
    marginBottom: 25,
    textShadowColor: web3Colors.primary + '60',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionCard: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  actionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },
  roastText: {
    fontSize: 18,
    color: web3Colors.accent,
    fontFamily: 'comicsansbold',
    fontWeight: '700',
    letterSpacing: 1,
  },
  earnText: {
    fontSize: 18,
    color: web3Colors.accent2,
    fontFamily: 'comicsansbold',
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionDivider: {
    paddingHorizontal: 8,
  },
  dividerText: {
    fontSize: 16,
    color: web3Colors.textDim,
    fontFamily: 'comicintalics',
  },
  showcaseBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },

  // Visual Section
  visualSection: {
    alignItems: 'center',
  },
  visualContainer: {
    position: 'relative',
    width: width * 0.85,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  dashboardContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    padding: 15,
    overflow: 'hidden',
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: web3Colors.border,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  statValue: {
    fontSize: 14,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 8,
    color: web3Colors.textMuted,
    fontFamily: 'comicintalics',
    letterSpacing: 0.5,
  },
  
  // Activity Graph
  activityGraph: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: web3Colors.border,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  graphBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  graphBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 40,
    marginBottom: 8,
  },
  graphBarContainer: {
    width: 8,
    height: '100%',
    justifyContent: 'flex-end',
  },
  graphBar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  graphLabel: {
    fontSize: 8,
    color: web3Colors.textMuted,
    fontFamily: 'comicintalics',
    letterSpacing: 0.5,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actionBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  actionIcon: {
    fontSize: 14,
  },
  
  hologramEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  systemStatus: {
    alignItems: 'center',
    marginBottom: 25,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: web3Colors.textMuted,
    fontFamily: 'comicintalics',
    letterSpacing: 0.5,
  },
  primaryButton: {
    width: width * 0.8,
    borderRadius: 35,
    elevation: 20,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    marginBottom: 18,
  },
  buttonGradient: {
    borderRadius: 35,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContainer: {
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 35,
  },
  buttonLabel: {
    fontSize: 17,
    color: web3Colors.text,
    fontFamily: 'comicsansbold',
    fontWeight: '800',
    letterSpacing: 2,
    marginRight: 12,
  },
  buttonIcon: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: web3Colors.text,
    fontSize: 12,
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
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: web3Colors.accent2,
  },
  connectionLabel: {
    fontSize: 11,
    color: web3Colors.textMuted,
    fontFamily: 'comicintalics',
  },

  // Ambient Effects
  ambientEffects: {
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
    width: 16,
    height: 16,
  },
  particleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  neuralNetwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  neuralLine1: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '30%',
    height: 1,
    transform: [{ rotate: '15deg' }],
  },
  neuralLine2: {
    position: 'absolute',
    top: '60%',
    left: '20%',
    right: '10%',
    height: 1,
    transform: [{ rotate: '-10deg' }],
  },
  neuralLine3: {
    position: 'absolute',
    top: '80%',
    left: '40%',
    right: '20%',
    height: 1,
    transform: [{ rotate: '8deg' }],
  },
});