import React, {createContext, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {notification} from 'antd';

import {version} from '../../package.json';
import {EntityActivityStats, SessionUser, TenantConfig} from '../Types/api';
import ErrorHandler from '../Utils/ErrorHandler';

interface AuthContextDefaults {
  user: SessionUser | null;
  sessionToken?: string;
  setUser: (data: any) => void;
  logout: () => Promise<any>;
  config?: TenantConfig;
  setPreferredMode: (value: string) => void;
  setDarkMode: (value: boolean) => void;
  preferredMode?: string;
  darkMode?: boolean;
  openMenu: boolean;
  activityCount?: EntityActivityStats;
  updateActivityCount?: () => void;
  uploadProgress?: any;
  setOpenMenu: (value: boolean) => void;
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
  setPreferredMode(): void {},
  setDarkMode(): void {},
  user: null,
  openMenu: false,
  setOpenMenu(): void {},
});
const token = Cookies.get('session_token');

const AuthContextProvider = ({children, config}: AuthContextProp) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>();
  const [openMenu, setOpenMenu] = useState(false);
  const [preferredMode, setPreferredMode] = useState<string>('auto');
  const [uploadProgress, setUploadProgress] = useState<any>();
  const [activityCount, setActivityCount] = useState<any>();
  const [reloadActivity, setReloadActivity] = useState(false);

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
          if (window.location.pathname.indexOf('/auth/login') === -1) {
            window.location.href = '/auth/login';
          }
          ErrorHandler.showNotification(error);
        });
    }
  }, []);

  useEffect(() => {
    if (user) {
      axios
        .get('/entity-activity/my-tasks-stats')
        .then(response => {
          setActivityCount(response.data);
        })
        .catch(error => {
          ErrorHandler.showNotification(error);
        });
    }
  }, [user, reloadActivity]);

  useEffect(() => {
    const localVersion = localStorage.getItem('version');
    if (localVersion !== version) {
      setTimeout(() => {
        notification.open({
          message: `¡Nueva versión v${version}!`,
          placement: 'bottomLeft',
          className: 'deploy-alert-wrapper',
          description: (
            <ul
              style={{
                padding: '5px 5px 5px 20px',
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: '5px',
              }}>
              <li>Nuevo motor de carga de archivos, permite cambiar de pantalla sin perder el progreso de carga</li>
            </ul>
          ),
          duration: 0,
        });
      }, 1000);
      localStorage.setItem('version', version);
    }
  }, []);

  const updateActivityCount = () => {
    setReloadActivity(!reloadActivity);
  };

  const logout = async () => {
    await axios.get('authentication/logout');
    setUser(null);
    Cookies.remove('session_token');
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        config,
        setPreferredMode,
        setDarkMode,
        preferredMode,
        darkMode,
        openMenu,
        setOpenMenu,
        uploadProgress,
        activityCount,
        updateActivityCount,
        sessionToken: token,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContextProvider};
export default AuthContext;
