import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import LinearGradient from 'react-native-linear-gradient';
import AiRoastScreen from './TabBarScreens/AiRoastScreen';
import TopMemesScreen from './TabBarScreens/TopMemesScreen';
import ReelsScreen from './TabBarScreens/ReelsScreen';
import BonkFeedScreen from './TabBarScreens/BonkFeedScreen';
import colors from '../../../constants/colors';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

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
};

const CustomTabLabel = ({ label, icon, focused }) => {
  return (
    <View style={styles.tabLabelContainer}>
      {focused && (
        <LinearGradient
          colors={[web3Colors.primary, web3Colors.secondary]}
          style={styles.activeTabBackground}
        />
      )}
      <View style={[styles.tabContent, focused && styles.activeTabContent]}>
        <View style={styles.iconContainer}>
          {focused && (
            <LinearGradient
              colors={[web3Colors.primary, web3Colors.secondary]}
              style={styles.iconGlow}
            />
          )}
          <Ionicons 
            name={icon} 
            size={18} 
            color={focused ? web3Colors.text : web3Colors.textSecondary}
            style={[styles.tabIcon, focused && styles.activeTabIcon]}
          />
        </View>
        <Text style={[
          styles.tabText, 
          focused ? styles.activeTabText : styles.inactiveTabText
        ]}>
          {label}
        </Text>
      </View>
      
      {/* Animated indicator dot */}
      {focused && (
        <View style={styles.indicatorDot}>
          <LinearGradient
            colors={[web3Colors.primary, web3Colors.secondary]}
            style={styles.indicatorDotGradient}
          />
        </View>
      )}
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, position }) => {
  return (
    <View style={styles.tabBarWrapper}>
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.95)', 'rgba(26, 26, 46, 0.95)']}
        style={styles.tabBarContainer}
      >
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getTabConfig = () => {
              switch (route.name) {
                case 'AiRoast':
                  return { label: 'AI ROAST', icon: 'flame-outline' };
                case 'TopMemes':
                  return { label: 'Top Memes', icon: 'star-outline' };
                case 'Reels':
                  return { label: 'Reels', icon: 'play-circle-outline' };
                case 'BonkFeed':
                  return { label: 'Bonk Feed', icon: 'rocket-outline' };
                default:
                  return { label: route.name, icon: 'ellipse-outline' };
              }
            };

            const { label, icon } = getTabConfig();

            return (
              <View key={route.key} style={styles.tabItem}>
                <View 
                  style={styles.touchableArea}
                  onTouchEnd={onPress}
                />
                <CustomTabLabel 
                  label={label} 
                  icon={icon} 
                  focused={isFocused} 
                />
              </View>
            );
          })}
        </View>
        
        {/* Decorative elements */}
        <View style={styles.decorativeBottom}>
          <LinearGradient
            colors={[web3Colors.primary, web3Colors.secondary, 'transparent']}
            style={styles.bottomGlow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        
        {/* Animated background particles */}
        <View style={styles.particleContainer}>
          <View style={[styles.particle, styles.particle1]} />
          <View style={[styles.particle, styles.particle2]} />
          <View style={[styles.particle, styles.particle3]} />
        </View>
      </LinearGradient>
    </View>
  );
};

const TopTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
    >
      <Tab.Screen
        name="AiRoast"
        component={AiRoastScreen}
      />
      <Tab.Screen
        name="TopMemes"
        component={TopMemesScreen}
      />
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
      />
      <Tab.Screen
        name="BonkFeed"
        component={BonkFeedScreen}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  tabBarContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: web3Colors.border,
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  tabLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeTabBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    opacity: 0.15,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabContent: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.3,
  },
  tabIcon: {
    marginBottom: 2,
  },
  activeTabIcon: {
    transform: [{ scale: 1.1 }],
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'comicsansbold',
    textAlign: 'center',
  },
  activeTabText: {
    color: web3Colors.text,
    textShadowColor: web3Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inactiveTabText: {
    color: web3Colors.textSecondary,
  },
  indicatorDot: {
    position: 'absolute',
    bottom: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorDotGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  touchableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  bottomGlow: {
    height: 2,
    opacity: 0.4,
  },
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: web3Colors.primary,
    opacity: 0.3,
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '60%',
    right: '25%',
  },
  particle3: {
    top: '40%',
    left: '70%',
  },
});

export default TopTabs;