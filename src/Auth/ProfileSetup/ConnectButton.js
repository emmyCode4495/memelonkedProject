
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../../persistence/AuthContext';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_IDENTITY } from '../providers/AuthorizationProvider'; 
import { getPublicKeyFromAddress } from '../../../utils/getPublicKeyFromAddress'; 
import enndpoint from '../../../constants/enndpoint';


export default function ConnectButton({ onConnect }) {
  const { login } = useContext(AuthContext);

  const onPress = async () => {
    await transact(async wallet => {
      const authResult = await wallet.authorize({
        cluster: 'mainnet-beta',
        identity: APP_IDENTITY,
      });

      const { accounts, auth_token } = authResult;
      const walletAddress = accounts[0].address;
      const label = accounts[0].label;

      try {
        const res = await axios.get(`${enndpoint.main}/api/users?wallet=${walletAddress}`);
        
        if (res.data.user) {
         
          login(res.data.user); 
        } else {
       
          onConnect({
            address: walletAddress,
            label: label,
            authToken: auth_token,
            publicKey: getPublicKeyFromAddress(walletAddress),
          });
        }
      } catch (err) {
        console.log('Login lookup failed:', err.message);
       
        onConnect({
          address: walletAddress,
          label: label,
          authToken: auth_token,
          publicKey: getPublicKeyFromAddress(walletAddress),
        });
      }
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Connect Wallet</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});