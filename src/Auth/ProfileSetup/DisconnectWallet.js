import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DisconnectWallet({ onDisconnect, authorization }) {
  const onPress = async () => {
    try {
    
      if (authorization?.authToken) {
        try {
          await transact(async wallet => {
            await wallet.deauthorize({
              auth_token: authorization.authToken,
            });
          });
        } catch (error) {
          console.log('Non-critical deauthorization error:', error);
        }
      }

    
      await AsyncStorage.removeItem('wallet_connection');
      onDisconnect();
      
    } catch (error) {
      console.error('Disconnection error:', error);
      Alert.alert(
        'Disconnection Error',
        'There was an issue disconnecting your wallet. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Disconnect Wallet</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
