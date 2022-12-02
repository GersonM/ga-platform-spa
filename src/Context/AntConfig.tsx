import React, {useEffect, useState} from 'react';
import {ConfigProvider, theme} from "antd";

interface AntConfigProps {
  children: React.ReactNode;
}

const AntConfig = ({children}: AntConfigProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const media = window
      .matchMedia("(prefers-color-scheme: dark)").matches? "dark" : "light";
    setDarkMode(media === 'dark');
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function (e) {
        const colorScheme = e.matches ? "dark" : "light";
        console.log(colorScheme);
        setDarkMode(colorScheme === 'dark');
      });
    return () => {
      window.removeEventListener('change', function () {
      });
    }
  }, []);

  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: import.meta.env.VITE_PRIMARY_COLOR,
        fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif',
        fontSize: 14,
        fontWeightStrong:400
      },
      algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
      {children}
    </ConfigProvider>
  );
};

export default AntConfig;
