import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../persistence/AuthContext';
import TopTabNavigator from './TabNavigator/TopTabNavigator';


const HomePage = () => {


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

  return (
    <View style={styles.container}>
     <View style={{marginTop:'12%'}}/>
     <TopTabNavigator />
        
      
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },

});
