import {useContext} from 'react';
import AuthContext from '../Context/AuthContext';
import {MoonIcon, SunIcon} from '@heroicons/react/24/outline';

const ScreenModeSelector = () => {
  const {darkMode, setPreferredMode} = useContext(AuthContext);

  let nextMode = 'light';

  if (darkMode) {
    nextMode = 'auto';
  } else {
    nextMode = 'dark';
  }

  return (
    <div
      className={'user-tool'}
      onClick={() => {
        setPreferredMode(nextMode);
      }}>
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </div>
  );
};

export default ScreenModeSelector;
