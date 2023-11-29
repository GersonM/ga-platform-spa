import React, {useContext} from 'react';
import {Outlet} from 'react-router-dom';
import Navigation from '../Navigation';
import AuthContext from '../Context/AuthContext';

const AppAuthenticated = () => {
  const {user} = useContext(AuthContext);

  if (!user) {
    return null;
    //TODO: Think on show a loader here
  }

  return (
    <div className="app-container">
      <Navigation />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AppAuthenticated;
