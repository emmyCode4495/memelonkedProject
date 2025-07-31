import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../Auth/Welcome';
import WalletConnectScreen from '../Auth/ProfileSetup/WalletConnectScreen';
import ProfileDetailsSetup from '../Auth/ProfileSetup/ProfileDetailsSetup';



const Stack = createNativeStackNavigator();


const AuthNavigator = () => {
  return (
     <Stack.Navigator 
     screenOptions={{
        headerShown:false
     }}
     initialRouteName='welcome'
     >
      <Stack.Screen name="welcome" component={Welcome} />
       <Stack.Screen name="connect" component={WalletConnectScreen} />
       <Stack.Screen name="usersetup" component={ProfileDetailsSetup} />
    </Stack.Navigator>
  )
}

export default AuthNavigator

const styles = StyleSheet.create({})