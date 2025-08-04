import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { PublicKey } from '@solana/web3.js';

import { toUint8Array } from 'js-base64';

import { RPC_ENDPOINT } from './ConnectionProvider';

const APP_IDENTITY = {
  name: 'Memelonked',
  uri: 'https://solanamobile.com',
  icon: require('../../../assets/images/memelogo.png'),
};

function getPublicKeyFromAddress(address) {
  const publicKeyByteArray = toUint8Array(address);
  return new PublicKey(publicKeyByteArray);
}

function getAccountFromAuthorizedAccount(account) {
  return {
    ...account,
    publicKey: getPublicKeyFromAddress(account.address),
  };
}

function getAuthorizationFromAuthorizationResult(result, previousSelectedAccount) {
  let selectedAccount;

  if (
    !previousSelectedAccount ||
    !result.accounts.some(({ address }) => address === previousSelectedAccount.address)
  ) {
    const firstAccount = result.accounts[0];
    selectedAccount = getAccountFromAuthorizedAccount(firstAccount);
  } else {
    selectedAccount = previousSelectedAccount;
  }

  return {
    accounts: result.accounts.map(getAccountFromAuthorizedAccount),
    authToken: result.auth_token,
    selectedAccount,
  };
}

const AuthorizationContext = createContext({
  accounts: null,
  authorizeSession: () => {
    throw new Error('AuthorizationProvider not initialized');
  },
  deauthorizeSession: () => {
    throw new Error('AuthorizationProvider not initialized');
  },
  onChangeAccount: () => {
    throw new Error('AuthorizationProvider not initialized');
  },
  selectedAccount: null,
});

function AuthorizationProvider({ children }) {
  const [authorization, setAuthorization] = useState(null);

  const handleAuthorizationResult = useCallback(
    async (result) => {
      const nextAuth = getAuthorizationFromAuthorizationResult(
        result,
        authorization?.selectedAccount
      );
      setAuthorization(nextAuth);
      return nextAuth;
    },
    [authorization]
  );

  const authorizeSession = useCallback(
    async (wallet) => {
      const result = authorization
        ? await wallet.reauthorize({
            auth_token: authorization.authToken,
            identity: APP_IDENTITY,
          })
        : await wallet.authorize({
            cluster: RPC_ENDPOINT,
            identity: APP_IDENTITY,
          });

      return (await handleAuthorizationResult(result)).selectedAccount;
    },
    [authorization, handleAuthorizationResult]
  );

  const deauthorizeSession = useCallback(
    async (wallet) => {
      if (!authorization?.authToken) return;
      await wallet.deauthorize({ auth_token: authorization.authToken });
      setAuthorization(null);
    },
    [authorization]
  );

  const onChangeAccount = useCallback((nextSelectedAccount) => {
    setAuthorization((currentAuth) => {
      if (
        !currentAuth?.accounts.some(
          ({ address }) => address === nextSelectedAccount.address
        )
      ) {
        throw new Error(`${nextSelectedAccount.address} is not one of the available addresses`);
      }
      return {
        ...currentAuth,
        selectedAccount: nextSelectedAccount,
      };
    });
  }, []);

  const value = useMemo(() => ({
    accounts: authorization?.accounts ?? null,
    authorizeSession,
    deauthorizeSession,
    onChangeAccount,
    selectedAccount: authorization?.selectedAccount ?? null,
  }), [authorization, authorizeSession, deauthorizeSession, onChangeAccount]);

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

function useAuthorization() {
  return useContext(AuthorizationContext);
}

export { AuthorizationProvider, useAuthorization, APP_IDENTITY };
