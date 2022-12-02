import React, {useEffect, useState} from 'react';
import {ConfigProvider, theme} from 'antd';

interface AntConfigProps {
  children: React.ReactNode;
  color: string;
}

const AntConfig = ({color, children}: AntConfigProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const r = document.querySelector(':root');
    //@ts-ignore
    r.style.setProperty('--primary-color', color);
  }, [color]);

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
          colorPrimary: color,
          fontFamily: 'Barlow, Helvetica, Arial, sans-serif',
          fontSize: 15,
          fontWeightStrong: 400,
        },
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      {children}
    </ConfigProvider>
  );
};

export default AntConfig;
