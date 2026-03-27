import React, { useContext } from 'react';
import AuthContext from '../Context/AuthContext';
import { TbMoon, TbSun, TbDeviceDesktop } from "react-icons/tb";

const ScreenModeSelector = () => {
  const { darkMode, preferredMode, setPreferredMode } = useContext(AuthContext);

  const toggleMode = () => {
    if (preferredMode === 'light') {
      setPreferredMode('dark');
    } else {
      setPreferredMode('light');
    }
  };

  const renderIcon = () => {
    if (preferredMode === 'light') return <TbSun />;
    if (preferredMode === 'dark') return <TbMoon />;
    return <TbDeviceDesktop />
  };

  return (
    <div
      className="user-tool"
      onClick={toggleMode}
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '20px' 
      }}
    >
      {renderIcon()}
    </div>
  );
};

export default ScreenModeSelector;