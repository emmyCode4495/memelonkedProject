// import { 
//   Alert, 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   TouchableOpacity, 
//   View,
//   ScrollView,
//   ActivityIndicator,
//   Image,
//   Dimensions
// } from 'react-native';
// import React, { useContext, useState, useEffect } from 'react';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import { AuthContext } from '../../../../persistence/AuthContext';
// import axios from 'axios';
// import enndpoint from '../../../../../constants/enndpoint';


// const { width } = Dimensions.get('window');

// // Web3 Color Palette (same as your GiftsWalletScreen)
// const web3Colors = {
//   primary: '#00D4FF',
//   secondary: '#9945FF',
//   accent: '#14F195',
//   background: '#0D0E1A',
//   cardBg: '#1A1B2E',
//   border: '#2A2B3E',
//   text: '#FFFFFF',
//   textSecondary: '#A0A3BD',
//   gradient1: '#9945FF',
//   gradient2: '#00D4FF',
//   bonk: '#FF6B35',
//   success: '#14F195',
//   warning: '#FFB800',
//   error: '#FF4757',
// };

// const ProfileScreen = () => {
//   const { logout, user, walletInfo } = useContext(AuthContext);
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Get wallet address from user or walletInfo
//   const getWalletAddress = () => {
//     if (user?.walletAddress) {
//       return user.walletAddress;
//     }
//     if (walletInfo?.address) {
//       // Handle different address formats
//       let cleanAddress = walletInfo.address.trim();
//       if (typeof cleanAddress === 'string') {
//         return cleanAddress;
//       }
//     }
//     return null;
//   };

//  // Fetch user profile data
//   const fetchUserProfile = async () => {
//     const walletAddress = getWalletAddress();
//     if (!walletAddress) return;

//     setLoading(true);
//     try {
//       const response = await axios.get(`http://${enndpoint.main}:5000/api/users?wallet=${walletAddress}`);
//       setUserProfile(response.data.user);
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       // Optional: Set an error state or show an alert
//       Alert.alert('Error', 'Failed to fetch user profile. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);


//   const handleLogout = () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: () => {
//           logout();
//         },
//       },
//     ]);
//   };

//   const formatWalletAddress = (address) => {
//     if (!address) return 'Not connected';
//     return `${address.slice(0, 6)}...${address.slice(-6)}`;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Unknown';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const ProfileMenuItem = ({ icon, title, subtitle, onPress, showChevron = true, iconColor = web3Colors.primary }) => (
//     <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
//       <View style={styles.menuItemLeft}>
//         <View style={[styles.menuItemIcon, { backgroundColor: `${iconColor}20` }]}>
//           <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
//         </View>
//         <View style={styles.menuItemText}>
//           <Text style={styles.menuItemTitle}>{title}</Text>
//           {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
//         </View>
//       </View>
//       {showChevron && (
//         <Ionicons name="chevron-forward" size={20} color={web3Colors.textSecondary} />
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <LinearGradient
//           colors={[web3Colors.gradient1, web3Colors.gradient2]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.headerGradient}
//         >
//           <TouchableOpacity style={styles.backButton}>
//             <Ionicons name="chevron-back" size={24} color={web3Colors.text} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={styles.headerRight}>
//             <TouchableOpacity style={styles.headerIcon} onPress={fetchUserProfile}>
//               {loading ? (
//                 <ActivityIndicator size="small" color={web3Colors.text} />
//               ) : (
//                 <MaterialIcons name="refresh" size={24} color={web3Colors.text} />
//               )}
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>
//       </View>

//       <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
//         {/* Profile Card */}
//         <View style={styles.profileCard}>
//           <LinearGradient
//             colors={[web3Colors.cardBg, web3Colors.border]}
//             style={styles.profileGradient}
//           >
//             {loading ? (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color={web3Colors.primary} />
//                 <Text style={styles.loadingText}>Loading profile...</Text>
//               </View>
//             ) : userProfile ? (
//               <>
//                 {/* Avatar */}
//                 <View style={styles.avatarContainer}>
//                   <LinearGradient
//                     colors={[web3Colors.gradient1, web3Colors.gradient2]}
//                     style={styles.avatarGradient}
//                   >
//                     <MaterialCommunityIcons 
//                       name="account" 
//                       size={60} 
//                       color={web3Colors.text} 
//                     />
//                   </LinearGradient>
//                 </View>

//                 {/* User Info */}
//                 <View style={styles.userInfo}>
//                   <Text style={styles.username}>{userProfile.username || 'Anonymous User'}</Text>
//                   <Text style={styles.userEmail}>{userProfile.email || 'No email provided'}</Text>
                  
//                   {userProfile.bio && (
//                     <View style={styles.bioContainer}>
//                       <Text style={styles.bioText}>{userProfile.bio}</Text>
//                     </View>
//                   )}

//                   {/* Wallet Badge */}
//                   <View style={styles.walletBadge}>
//                     <MaterialCommunityIcons name="wallet" size={16} color={web3Colors.accent} />
//                     <Text style={styles.walletText}>
//                       {formatWalletAddress(userProfile.walletAddress)}
//                     </Text>
//                   </View>
//                 </View>
//               </>
//             ) : (
//               <View style={styles.noDataContainer}>
//                 <MaterialCommunityIcons name="account-off" size={60} color={web3Colors.textSecondary} />
//                 <Text style={styles.noDataText}>No profile data found</Text>
//               </View>
//             )}
//           </LinearGradient>
//         </View>

//         {/* Stats Cards */}
//         {userProfile && (
//           <View style={styles.statsContainer}>
//             <View style={styles.statCard}>
//               <LinearGradient
//                 colors={[web3Colors.cardBg, web3Colors.border]}
//                 style={styles.statGradient}
//               >
//                 <MaterialCommunityIcons name="calendar-clock" size={28} color={web3Colors.primary} />
//                 <Text style={styles.statLabel}>Member Since</Text>
//                 <Text style={styles.statValue}>{formatDate(userProfile.createdAt)}</Text>
//               </LinearGradient>
//             </View>

//             <View style={styles.statCard}>
//               <LinearGradient
//                 colors={[web3Colors.cardBg, web3Colors.border]}
//                 style={styles.statGradient}
//               >
//                 <MaterialCommunityIcons name="identifier" size={28} color={web3Colors.bonk} />
//                 <Text style={styles.statLabel}>User ID</Text>
//                 <Text style={styles.statValue}>
//                   {userProfile.uid ? `${userProfile.uid.slice(0, 8)}...` : 'N/A'}
//                 </Text>
//               </LinearGradient>
//             </View>
//           </View>
//         )}

//         {/* Menu Section */}
//         <View style={styles.menuSection}>
//           <Text style={styles.sectionTitle}>Account Settings</Text>
          
//           <View style={styles.menuContainer}>
//             <ProfileMenuItem
//               icon="account-edit"
//               title="Edit Profile"
//               subtitle="Update your personal information"
//               onPress={() => {/* Navigate to edit profile */}}
//               iconColor={web3Colors.primary}
//             />
            
//             <ProfileMenuItem
//               icon="wallet"
//               title="Wallet Settings"
//               subtitle="Manage your connected wallet"
//               onPress={() => {/* Navigate to wallet settings */}}
//               iconColor={web3Colors.accent}
//             />
            
//             <ProfileMenuItem
//               icon="security"
//               title="Security"
//               subtitle="Privacy and security settings"
//               onPress={() => {/* Navigate to security */}}
//               iconColor={web3Colors.warning}
//             />
            
//             <ProfileMenuItem
//               icon="help-circle"
//               title="Help & Support"
//               subtitle="Get help and contact support"
//               onPress={() => {/* Navigate to help */}}
//               iconColor={web3Colors.secondary}
//             />
//           </View>
//         </View>

//         {/* Logout Section */}
//         <View style={styles.logoutSection}>
//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
//             <LinearGradient
//               colors={[web3Colors.error, '#FF6B7A']}
//               style={styles.logoutGradient}
//             >
//               <MaterialCommunityIcons name="logout" size={24} color={web3Colors.text} />
//               <Text style={styles.logoutText}>Logout</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>

//         {/* Bottom Padding */}
//         <View style={styles.bottomPadding} />
//       </ScrollView>
//     </View>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: web3Colors.background,
//   },
//   header: {
//     paddingTop: 50,
//   },
//   headerGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerRight: {
//     width: 40,
//     alignItems: 'flex-end',
//   },
//   headerIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   profileCard: {
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 20,
//     overflow: 'hidden',
//     elevation: 8,
//     shadowColor: web3Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   profileGradient: {
//     padding: 24,
//     alignItems: 'center',
//     minHeight: 200,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     marginTop: 12,
//   },
//   avatarContainer: {
//     marginBottom: 20,
//   },
//   avatarGradient: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 10,
//     shadowColor: web3Colors.primary,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//   },
//   userInfo: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   username: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginBottom: 8,
//   },
//   userEmail: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     marginBottom: 12,
//   },
//   bioContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 12,
//     marginBottom: 16,
//     maxWidth: '90%',
//   },
//   bioText: {
//     fontSize: 14,
//     color: web3Colors.text,
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   walletBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: web3Colors.border,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   walletText: {
//     fontSize: 12,
//     color: web3Colors.accent,
//     marginLeft: 6,
//     fontFamily: 'monospace',
//     fontWeight: '600',
//   },
//   noDataContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },
//   noDataText: {
//     fontSize: 16,
//     color: web3Colors.textSecondary,
//     marginTop: 12,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginHorizontal: 20,
//     marginTop: 24,
//   },
//   statCard: {
//     flex: 1,
//     marginHorizontal: 6,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   statGradient: {
//     padding: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//     marginTop: 8,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   statValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     textAlign: 'center',
//   },
//   menuSection: {
//     marginTop: 32,
//     marginHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginBottom: 16,
//   },
//   menuContainer: {
//     backgroundColor: web3Colors.cardBg,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: web3Colors.border,
//     overflow: 'hidden',
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: web3Colors.border,
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   menuItemIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   menuItemText: {
//     flex: 1,
//   },
//   menuItemTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: web3Colors.text,
//     marginBottom: 2,
//   },
//   menuItemSubtitle: {
//     fontSize: 12,
//     color: web3Colors.textSecondary,
//   },
//   logoutSection: {
//     marginHorizontal: 20,
//     marginTop: 32,
//   },
//   logoutButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     elevation: 4,
//     shadowColor: web3Colors.error,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//   },
//   logoutGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//   },
//   logoutText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: web3Colors.text,
//     marginLeft: 12,
//   },
//   bottomPadding: {
//     height: 40,
//   },
// });

import { 
  Alert, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { AuthContext } from '../../../../persistence/AuthContext';
import enndpoint from '../../../../../constants/enndpoint';

const { width } = Dimensions.get('window');

// Web3 Color Palette (same as your GiftsWalletScreen)
const web3Colors = {
  primary: '#00D4FF',
  secondary: '#9945FF',
  accent: '#14F195',
  background: '#0D0E1A',
  cardBg: '#1A1B2E',
  border: '#2A2B3E',
  text: '#FFFFFF',
  textSecondary: '#A0A3BD',
  gradient1: '#9945FF',
  gradient2: '#00D4FF',
  bonk: '#FF6B35',
  success: '#14F195',
  warning: '#FFB800',
  error: '#FF4757',
};

const ProfileScreen = () => {
  const { logout, user, walletInfo } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get wallet address from user or walletInfo
  const getWalletAddress = () => {
    if (user?.walletAddress) {
      return user.walletAddress;
    }
    if (walletInfo?.address) {
      // Handle different address formats
      let cleanAddress = walletInfo.address.trim();
      if (typeof cleanAddress === 'string') {
        return cleanAddress;
      }
    }
    return null;
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    const walletAddress = getWalletAddress();
    if (!walletAddress) return;

    setLoading(true);
    try {
      const response = await axios.get(`${enndpoint.main}/api/users?wallet=${walletAddress}`);
      setUserProfile(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Optional: Set an error state or show an alert
      Alert.alert('Error', 'Failed to fetch user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const formatWalletAddress = (address) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ProfileMenuItem = ({ icon, title, subtitle, onPress, showChevron = true, iconColor = web3Colors.primary }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, { backgroundColor: `${iconColor}20` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={web3Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[web3Colors.gradient1, web3Colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={web3Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={fetchUserProfile}>
              {loading ? (
                <ActivityIndicator size="small" color={web3Colors.text} />
              ) : (
                <MaterialIcons name="refresh" size={24} color={web3Colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[web3Colors.cardBg, web3Colors.border]}
            style={styles.profileGradient}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={web3Colors.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
              </View>
            ) : userProfile ? (
              <>
                {/* Avatar with Logout Button */}
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={[web3Colors.gradient1, web3Colors.gradient2]}
                    style={styles.avatarGradient}
                  >
                    <MaterialCommunityIcons 
                      name="account" 
                      size={60} 
                      color={web3Colors.text} 
                    />
                  </LinearGradient>
                  
                  {/* Logout Button beside avatar */}
                  <TouchableOpacity 
                    style={styles.logoutIconButton} 
                    onPress={handleLogout}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[web3Colors.error, '#FF6B7A']}
                      style={styles.logoutIconGradient}
                    >
                      <MaterialCommunityIcons name="logout" size={20} color={web3Colors.text} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{userProfile.username || 'Anonymous User'}</Text>
                  <Text style={styles.userEmail}>{userProfile.email || 'No email provided'}</Text>
                  
                  {userProfile.bio && (
                    <View style={styles.bioContainer}>
                      <Text style={styles.bioText}>{userProfile.bio}</Text>
                    </View>
                  )}

                  {/* Wallet Badge */}
                  <View style={styles.walletBadge}>
                    <MaterialCommunityIcons name="wallet" size={16} color={web3Colors.accent} />
                    <Text style={styles.walletText}>
                      {formatWalletAddress(userProfile.walletAddress)}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="account-off" size={60} color={web3Colors.textSecondary} />
                <Text style={styles.noDataText}>No profile data found</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        {userProfile && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[web3Colors.cardBg, web3Colors.border]}
                style={styles.statGradient}
              >
                <MaterialCommunityIcons name="calendar-clock" size={28} color={web3Colors.primary} />
                <Text style={styles.statLabel}>Member Since</Text>
                <Text style={styles.statValue}>{formatDate(userProfile.createdAt)}</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={[web3Colors.cardBg, web3Colors.border]}
                style={styles.statGradient}
              >
                <MaterialCommunityIcons name="identifier" size={28} color={web3Colors.bonk} />
                <Text style={styles.statLabel}>User ID</Text>
                <Text style={styles.statValue}>
                  {userProfile.uid ? `${userProfile.uid.slice(0, 8)}...` : 'N/A'}
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.menuContainer}>
            <ProfileMenuItem
              icon="account-edit"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => {/* Navigate to edit profile */}}
              iconColor={web3Colors.primary}
            />
            
            <ProfileMenuItem
              icon="wallet"
              title="Wallet Settings"
              subtitle="Manage your connected wallet"
              onPress={() => {/* Navigate to wallet settings */}}
              iconColor={web3Colors.accent}
            />
            
            <ProfileMenuItem
              icon="security"
              title="Security"
              subtitle="Privacy and security settings"
              onPress={() => {/* Navigate to security */}}
              iconColor={web3Colors.warning}
            />
            
            <ProfileMenuItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => {/* Navigate to help */}}
              iconColor={web3Colors.secondary}
            />
          </View>
        </View>

        {/* Logout Section - Removed since it's now beside avatar */}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: web3Colors.background,
  },
  header: {
    paddingTop: 50,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    marginBottom:"20%"
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 200,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    marginTop: 12,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: web3Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoutIconButton: {
    position: 'absolute',
    top: -5,
    right: -30,
    elevation: 12,
    shadowColor: web3Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: web3Colors.background,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    marginBottom: 12,
  },
  bioContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: '90%',
  },
  bioText: {
    fontSize: 14,
    color: web3Colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: web3Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletText: {
    fontSize: 12,
    color: web3Colors.accent,
    marginLeft: 6,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    color: web3Colors.textSecondary,
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: web3Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: web3Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: web3Colors.text,
    textAlign: 'center',
  },
  menuSection: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: web3Colors.text,
    marginBottom: 16,
  },
  menuContainer: {
    backgroundColor: web3Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: web3Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: web3Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: web3Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: web3Colors.textSecondary,
  },
  bottomPadding: {
    height: 40,
  },
});