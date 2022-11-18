import React, {createContext, useState} from 'react';
import axios from 'axios';

import {TenantConfig, User} from '../Types/api';
import Cookies from 'js-cookie';

interface AuthContextDefaults {
  user: User | null;
  setUser: (data: any) => void;
  logout: () => Promise<any>;
  config?: TenantConfig;
}

interface AuthContextProp {
  children?: React.ReactNode;
  config?: TenantConfig;
}

const AuthContext = createContext<AuthContextDefaults>({
  logout(): Promise<any> {
    return Promise.resolve(undefined);
  },
  setUser(): void {},
  user: null,
});

const AuthContextProvider = ({children, config}: AuthContextProp) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    await axios.get('authentication/logout');
    setUser(null);
    Cookies.remove('token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        config,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContextProvider};
export default AuthContext;
