import React, {Suspense, useContext} from 'react';
import {Outlet} from 'react-router-dom';

import logo from './../Assets/logo_full.png';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import LoadingIndicator from '../CommonUI/LoadingIndicator';
import './GuestLayout.less';

//const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY_PUBLIC);

const GuestLayout = () => {
  const {config, darkMode} = useContext(AuthContext);

  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <div className={'login-wrapper'}>
      <div className="login-block zoom-in">
        <div className="form-block">
          <img src={tenantLogo ? tenantLogo : logo} alt="Logo" className={'logo'} />
          <Suspense fallback={<LoadingIndicator />}>
            <Outlet />
          </Suspense>
          <span className={'version-info'}>Geek Advice v{Package.version}</span>
        </div>
      </div>
    </div>
  );
};

export default GuestLayout;
