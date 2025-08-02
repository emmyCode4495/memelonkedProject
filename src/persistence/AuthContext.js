// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [walletInfo, setWalletInfo] = useState(null); 

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Optional: load walletInfo if you decide to persist it
        const storedWallet = await AsyncStorage.getItem('walletInfo');
        if (storedWallet) {
          setWalletInfo(JSON.parse(storedWallet));
        }
      } catch (err) {
        console.log('Failed to load auth data from storage', err);
      }
    };

    loadUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    setWalletInfo(null); // 👈 clear wallet info
    await AsyncStorage.multiRemove(['user', 'walletInfo']);
  };

  const saveWalletInfo = async (info) => {
    setWalletInfo(info);
    await AsyncStorage.setItem('walletInfo', JSON.stringify(info));
  };

  const clearWalletInfo = async () => {
    setWalletInfo(null);
    await AsyncStorage.removeItem('walletInfo');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        walletInfo,
        saveWalletInfo,  
        clearWalletInfo, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
