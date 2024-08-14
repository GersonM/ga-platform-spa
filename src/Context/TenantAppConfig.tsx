import React, {useContext, useEffect} from 'react';
import {ConfigProvider, theme} from 'antd';
import tinyColor from 'tinycolor2';
import locale from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es-mx.js';

import {TenantConfig} from '../Types/api';
import AuthContext from './AuthContext';

dayjs.locale('es-mx');

interface AntConfigProps {
  children: React.ReactNode;
  tenant: TenantConfig;
}

const defaultColor = '#0082ca';
const defaultColorLight = '#52b5ff';

const TenantAppConfig = ({tenant, children}: AntConfigProps) => {
  const {darkMode, setDarkMode} = useContext(AuthContext);

  useEffect(() => {
    if (tenant.config.favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        //@ts-ignore
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      //@ts-ignore
      link.href = tenant.favicon;
    }

    const primaryColor = tenant.primary_color || defaultColor;
    const tColor = tinyColor(primaryColor);
    tColor.brighten(40);
    tColor.setAlpha(0.1);
    const r = document.querySelector(':root');
    //@ts-ignore
    r.style.setProperty('--primary-color', primaryColor);
    //@ts-ignore
    r.style.setProperty('--primary-color-glass', tColor);
  }, [tenant]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setDarkMode(media === 'dark');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      const colorScheme = e.matches ? 'dark' : 'light';
      setDarkMode(colorScheme === 'dark');
    });
    return () => {
      window.removeEventListener('change', function () {});
    };
  }, []);

  if (darkMode === undefined && !tenant) {
    return null;
  }

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: tenant.primary_color ? tenant.primary_color : darkMode ? defaultColorLight : defaultColor,
          colorLink: tenant.primary_color ? tenant.primary_color : defaultColor,
          fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
          fontSize: 13,
          borderRadius: 9,
        },
        components: {
          Modal: {
            titleFontSize: 24,
          },
          Button: {
            fontWeight: 500,
          },
          Input: {
            padding: 20,
          },
        },
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      {children}
    </ConfigProvider>
  );
};

export default TenantAppConfig;
