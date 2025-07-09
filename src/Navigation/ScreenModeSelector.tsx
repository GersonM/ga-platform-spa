import {useContext} from 'react';
import AuthContext from '../Context/AuthContext';
import {TbMoon, TbSun} from "react-icons/tb";

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
      {darkMode ? <TbSun /> : <TbMoon />}
    </div>
  );
};

export default ScreenModeSelector;
