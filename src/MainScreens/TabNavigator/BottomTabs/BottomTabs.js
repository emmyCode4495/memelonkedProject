import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AiRoastScreen from '../TabBarScreens/AiRoastScreen';
import TopTabs from '../TopTabNavigator';
import ProfileScreen from './BottomTabsScreen/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';

const Tab = createBottomTabNavigator();

import { Image } from 'react-native';
import GiftsWalletScreen from './BottomTabsScreen/GiftsWalletScreen';

// Assuming web3Colors from your sample styles
const web3Colors = {
  primary: '#00D4FF',
  secondary: '#9C27B0',
  background: '#0A0A0F',
  surface: '#1A1A2E',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.95)', 'rgba(26, 26, 46, 0.95)']}
        style={styles.tabBarGradient}
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

            const getTabIcon = () => {
              switch (route.name) {
                case 'home':
                  return isFocused
                    ? require('../../../../assets/images/home.png')
                    : require('../../../../assets/images/home1.png');
                case 'wallet':
                  return isFocused
                    ? require('../../../../assets/images/wallet2.png')
                    : require('../../../../assets/images/wallet.png');
                case 'profile':
                  return isFocused
                    ? require('../../../../assets/images/pro.png')
                    : require('../../../../assets/images/pro1.png');
                default:
                  return null;
              }
            };

            const getTabLabel = () => {
              switch (route.name) {
                case 'home':
                  return 'Home';
                case 'wallet':
                  return 'Wallet';
                case 'profile':
                  return 'Profile';
                default:
                  return '';
              }
            };

            return (
              <View key={route.key} style={styles.tabItem}>
                {isFocused && (
                  <LinearGradient
                    colors={[web3Colors.primary, web3Colors.secondary]}
                    style={styles.activeTabBackground}
                  />
                )}
                <View style={[styles.tabButton, isFocused && styles.activeTab]}>
                  <View style={styles.iconContainer}>
                    {isFocused && (
                      <LinearGradient
                        colors={[web3Colors.primary, web3Colors.secondary]}
                        style={styles.iconGlow}
                      />
                    )}
                    <Image
                      source={getTabIcon()}
                      style={[
                        styles.tabIcon,
                        isFocused && styles.activeTabIcon
                      ]}
                    />
                  </View>
                  {isFocused && (
                    <Text style={styles.tabLabel}>
                      {getTabLabel()}
                    </Text>
                  )}
                </View>
                <View 
                  style={styles.touchableArea}
                  onTouchEnd={onPress}
                />
              </View>
            );
          })}
        </View>
        
        {/* Decorative elements */}
        <View style={styles.decorativeTop}>
          <LinearGradient
            colors={[web3Colors.primary, 'transparent']}
            style={styles.glowLine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName='home'
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: 'transparent',
          marginTop: '20%',
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={TopTabs}
      />
      <Tab.Screen
        name="wallet"
        component={GiftsWalletScreen}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  tabBarGradient: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: web3Colors.border,
    elevation: 12,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    opacity: 0.1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minHeight: 50,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.2,
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: web3Colors.textSecondary,
  },
  activeTabIcon: {
    tintColor: web3Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    color: web3Colors.text,
    fontSize: 12,
    fontFamily: 'comicItalicsbold',
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: web3Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  touchableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  glowLine: {
    height: 1,
    opacity: 0.6,
  },
});