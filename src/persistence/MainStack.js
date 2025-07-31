import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '../MainScreens/HomePage';
import BottomTabs from '../MainScreens/TabNavigator/BottomTabs/BottomTabs';
import CreateMemePage from '../components/AIRoastComponents/CreateMemePage';


const Stack = createNativeStackNavigator();


const MainStack = () => {
  return (

     <Stack.Navigator 
     screenOptions={{
        headerShown:false
     }}
     initialRouteName='home'
     >
        <Stack.Screen name="home" component={BottomTabs} />
         <Stack.Screen name="creatememe" component={CreateMemePage} />
    </Stack.Navigator>
  

  )
}

export default MainStack

const styles = StyleSheet.create({})