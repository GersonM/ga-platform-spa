import React, {createContext, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {version} from '../../package.json';
import {TenantConfig, User} from '../Types/api';
import {notification} from 'antd';
import {BiRocket, IoRocketOutline} from 'react-icons/all';

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
      notification.open({
        message: `¡Nueva versión ${version}!`,
        placement: 'bottomLeft',
        icon: <IoRocketOutline />,
        description: (
          <div>
            <ul style={{padding: '0 0 0 20px'}}>
              <li>Modo oscuro automático</li>
              <li>Previsualización de imágenes en el navegador</li>
              <li>Mejoras en la interface</li>
            </ul>
          </div>
        ),
        duration: 0,
      });
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
