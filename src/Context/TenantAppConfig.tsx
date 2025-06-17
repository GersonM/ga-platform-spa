import {type ReactNode, useContext, useEffect} from 'react';
import {ConfigProvider, theme} from 'antd';
import tinyColor from 'tinycolor2';
import locale from 'antd/locale/es_ES';
import 'dayjs/locale/es-mx.js';

import type {TenantConfig} from '../Types/api';
import AuthContext from './AuthContext';

interface AntConfigProps {
  children: ReactNode;
  tenant: TenantConfig;
}

const defaultColor = '#0082ca';
const defaultColorLight = '#52b5ff';

const TenantAppConfig = ({tenant, children}: AntConfigProps) => {
  const {darkMode, preferredMode, setDarkMode} = useContext(AuthContext);

  useEffect(() => {
    if (tenant.favicon) {
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
    tColor.darken(16);
    const r = document.querySelector(':root');
    //@ts-ignore
    r.style.setProperty('--primary-color', primaryColor);
    //@ts-ignore
    r.style.setProperty('--primary-color-darker', tColor);
  }, [tenant]);

  useEffect(() => {
    if (preferredMode === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        const colorScheme = e.matches ? 'dark' : 'light';
        setDarkMode(colorScheme === 'dark');
      });
      return () => {
        window.removeEventListener('change', function () {});
      };
    }
  }, [preferredMode]);

  if (darkMode === undefined && !tenant) {
    return null;
  }

  return (
    <ConfigProvider
      locale={locale}
      variant={'filled'}
      theme={{
        token: {
          colorPrimary: tenant.primary_color ? tenant.primary_color : darkMode ? defaultColorLight : defaultColor,
          colorLink: tenant.primary_color ? tenant.primary_color : defaultColor,
          fontFamily: '"Red Hat Text", sans-serif',
        },
        components: {
          Modal: {
            titleFontSize: 20,
          },
          Button: {
            fontWeight: 600,
          },
        },
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      {children}
    </ConfigProvider>
  );
};

export default TenantAppConfig;
