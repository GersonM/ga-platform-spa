import React, {useContext} from 'react';
import AuthContext from '../Context/AuthContext';

const ScreenModeSelector = () => {
  const {user, darkMode, setPreferredMode} = useContext(AuthContext);

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
      {darkMode ? <i className={'icon-sun'} /> : <i className={'icon-moon'} />}
    </div>
  );
};

export default ScreenModeSelector;
