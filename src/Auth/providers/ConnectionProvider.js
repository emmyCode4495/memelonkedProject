import React, { useMemo, createContext, useContext } from 'react';
import { Connection } from '@solana/web3.js';

export const RPC_ENDPOINT = 'devnet';

const ConnectionContext = createContext({ connection: null });

const ConnectionProvider = ({ children, endpoint, config }) => {
  const connection = useMemo(() => {
    return new Connection(endpoint, config || { commitment: 'confirmed' });
  }, [endpoint, config]);

  return (
    <ConnectionContext.Provider value={{ connection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

const useConnection = () => {
  return useContext(ConnectionContext);
};

export { ConnectionProvider, useConnection, ConnectionContext };
