import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Linking } from 'react-native';

const SimpleWalletTest = () => {
  const [lastUrl, setLastUrl] = useState('');
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('=== RECEIVED DEEP LINK ===');
      console.log('Full URL:', url);
      
      setLastUrl(url);
      
      // Try to parse the URL
      try {
        const urlObj = new URL(url);
        const params = Object.fromEntries(urlObj.searchParams.entries());
        
        const parsed = {
          protocol: urlObj.protocol,
          host: urlObj.host,
          pathname: urlObj.pathname,
          search: urlObj.search,
          hash: urlObj.hash,
          parameters: params
        };
        
        console.log('Parsed URL:', JSON.stringify(parsed, null, 2));
        setParsedData(parsed);
        
        // Check for errors
        const errorKeys = Object.keys(params).filter(key => 
          key.toLowerCase().includes('error')
        );
        
        if (errorKeys.length > 0) {
          console.log('ERROR FOUND:', errorKeys.map(key => `${key}: ${params[key]}`));
          Alert.alert('Wallet Error', `${errorKeys[0]}: ${params[errorKeys[0]]}`);
        }
        
        // Check for public key
        const pkKeys = ['public_key', 'publicKey', 'pubkey', 'address', 'account'];
        const foundPkKey = pkKeys.find(key => params[key]);
        
        if (foundPkKey) {
          console.log('PUBLIC KEY FOUND:', `${foundPkKey}: ${params[foundPkKey]}`);
          Alert.alert('Success', `Found public key: ${params[foundPkKey].slice(0, 8)}...`);
        } else {
          console.log('NO PUBLIC KEY FOUND in parameters:', Object.keys(params));
        }
        
      } catch (e) {
        console.log('URL parsing failed:', e.message);
        Alert.alert('Parsing Error', e.message);
      }
    });

    return () => subscription?.remove();
  }, []);

  const testPhantomConnection = async () => {
    const testUrl = 'https://phantom.app/ul/v1/connect?' + new URLSearchParams({
      dapp_encryption_public_key: 'test123',
      cluster: 'mainnet-beta',
      app_url: 'https://memelonked.app',
      redirect_link: 'memelonked://wallet-callback',
    }).toString();
    
    console.log('Testing Phantom with URL:', testUrl);
    
    try {
      const canOpen = await Linking.canOpenURL(testUrl);
      if (canOpen) {
        await Linking.openURL(testUrl);
      } else {
        Alert.alert('Error', 'Cannot open Phantom wallet');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const testSolflareConnection = async () => {
    const testUrl = 'https://solflare.com/ul/v1/connect?' + new URLSearchParams({
      pubkey_request: 'true',
      cluster: 'mainnet-beta',
      app_url: 'https://memelonked.app',
      redirect_link: 'memelonked://wallet-callback',
    }).toString();
    
    console.log('Testing Solflare with URL:', testUrl);
    
    try {
      const canOpen = await Linking.canOpenURL(testUrl);
      if (canOpen) {
        await Linking.openURL(testUrl);
      } else {
        Alert.alert('Error', 'Cannot open Solflare wallet');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const clearData = () => {
    setLastUrl('');
    setParsedData(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Connection Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testPhantomConnection}>
          <Text style={styles.buttonText}>Test Phantom</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testSolflareConnection}>
          <Text style={styles.buttonText}>Test Solflare</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearData}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {lastUrl ? (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Last URL Received:</Text>
          <Text style={styles.urlText}>{lastUrl}</Text>
          
          {parsedData && (
            <>
              <Text style={styles.sectionTitle}>Parsed Parameters:</Text>
              <Text style={styles.dataText}>
                {JSON.stringify(parsedData.parameters, null, 2)}
              </Text>
              
              {parsedData.hash && (
                <>
                  <Text style={styles.sectionTitle}>URL Fragment:</Text>
                  <Text style={styles.dataText}>{parsedData.hash}</Text>
                </>
              )}
            </>
          )}
        </View>
      ) : (
        <Text style={styles.noDataText}>
          No deep link received yet. Try connecting with a wallet above.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  urlText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 50,
  },
});

export default SimpleWalletTest;