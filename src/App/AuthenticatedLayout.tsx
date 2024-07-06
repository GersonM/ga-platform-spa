import React, {useContext} from 'react';
import {Outlet} from 'react-router-dom';
import Navigation from '../Navigation';
import AuthContext from '../Context/AuthContext';

const AuthenticatedLayout = () => {
  const {user, sessionToken} = useContext(AuthContext);

  if (!user) {
    if (!sessionToken) {
      window.location.href = '/auth/login';
    }
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="app-content">
        <Outlet />
      </div>
    </>
  );
};

export default AuthenticatedLayout;
