import React, { useContext } from 'react';

import { AuthContext } from '../persistence/AuthContext';
import MainStack from './MainStack';
import AuthNavigator from './AuthNavigator';

const RootNavigator = () => {
  const { user } = useContext(AuthContext);

  return user ? <MainStack /> : <AuthNavigator />;

};

export default RootNavigator;
