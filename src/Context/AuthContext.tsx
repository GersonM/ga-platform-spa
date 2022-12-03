import React, {createContext, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {notification} from 'antd';

import {version} from '../../package.json';
import {TenantConfig, User} from '../Types/api';

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

  useEffect(() => {
    const localVersion = localStorage.getItem('version');
    if (localVersion !== version) {
      setTimeout(() => {
        notification.open({
          message: `¡Nueva versión v${version}!`,
          placement: 'bottomLeft',
          className: 'deploy-alert-wrapper',
          description: (
            <ul style={{padding: '0 0 0 20px'}}>
              <li>Edición nombre de archivos, contenedores y carpetas</li>
              <li>Eliminar carpetas</li>
            </ul>
          ),
          duration: 0,
        });
      }, 1000);
      localStorage.setItem('version', version);
    }
    console.log({version}, {localVersion});
  }, []);

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
