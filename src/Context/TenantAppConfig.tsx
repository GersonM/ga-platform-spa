import React, {useEffect, useState} from 'react';
import {ConfigProvider, theme} from 'antd';
import Helmet from 'react-helmet';
import {TenantConfig} from '../Types/api';

interface AntConfigProps {
  children: React.ReactNode;
  tenant: TenantConfig;
}

const TenantAppConfig = ({tenant, children}: AntConfigProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const r = document.querySelector(':root');

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

    //@ts-ignore
    r.style.setProperty('--primary-color', tenant.color);
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

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: tenant.color,
          fontFamily: 'Barlow, Helvetica, Arial, sans-serif',
          fontSize: 15,
          fontWeightStrong: 400,
        },
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      <Helmet>
        <title>Gestor de archivos :. {tenant.id}</title>
      </Helmet>
      {children}
    </ConfigProvider>
  );
};

export default TenantAppConfig;
