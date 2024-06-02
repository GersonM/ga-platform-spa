import React, {createContext, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {notification} from 'antd';

import {version} from '../../package.json';
import {TenantConfig, User} from '../Types/api';
import ErrorHandler from '../Utils/ErrorHandler';

interface AuthContextDefaults {
  user: User | null;
  sessionToken?: string;
  setUser: (data: any) => void;
  logout: () => Promise<any>;
  config?: TenantConfig;
  setDarkMode: (value: boolean) => void;
  darkMode?: boolean;
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
  setDarkMode(): void {},
  user: null,
});
const token = Cookies.get('session_token');

const AuthContextProvider = ({children, config}: AuthContextProp) => {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>();
  const [preferredMode] = useState('auto');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    if (preferredMode === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setDarkMode(media === 'dark');
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        const colorScheme = e.matches ? 'dark' : 'light';
        setDarkMode(colorScheme === 'dark');
      });

      return () => {
        window.removeEventListener('change', function () {});
      };
    } else {
      setDarkMode(preferredMode === 'dark');
    }
  }, [preferredMode]);

  useEffect(() => {
    if (token) {
      axios
        .get('/authentication/session')
        .then(userResponse => {
          if (userResponse) {
            setUser(userResponse.data);
          } else {
            if (window.location.pathname.indexOf('/auth/login') === -1) {
              window.location.href = '/auth/login';
            }
          }
        })
        .catch(error => {
          ErrorHandler.showNotification(error);
        });
    }
  }, []);

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
              <li>Se agrego la opción para borrar contenedores y carpetas</li>
              <li>Nueva opción para cambiar visibilidad de contenedores y carpetas</li>
              <li>Haz clic derecho sobre una carpeta para nuevas opciones</li>
            </ul>
          ),
          duration: 0,
        });
      }, 1000);
      localStorage.setItem('version', version);
    }
  }, []);

  const logout = async () => {
    await axios.get('authentication/logout');
    setUser(null);
    Cookies.remove('session_token');
    window.location.href = '/auth/login';
  };
  console.log('Auth context');
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        config,
        setDarkMode,
        darkMode,
        sessionToken: token,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContextProvider};
export default AuthContext;
