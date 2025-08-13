import {Suspense, useContext, useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import logo from './../Assets/ga_logo.webp';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import LoadingIndicator from '../CommonUI/LoadingIndicator';
import './GuestLayout.less';

const key = 'KcEke7cCtNBvgokFMxxhW2YUuV2AX3rrNVPyIyTo48Dwi7Accj2SRZjm';

const GuestLayout = () => {
  const {config, darkMode} = useContext(AuthContext);
  const [bgResource, setBgResource] = useState<string>();

  useEffect(() => {
    const query = 'cloud city ' + (darkMode ? 'night' : 'day');
    fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=15&page=1`,
      {headers: {Authorization: key,}},
    ).then((response) => {
      response.json().then(data => {
        const random = Math.floor(Math.random() * data.photos.length);
        setBgResource(data?.photos[random].src?.landscape);
      });
    });
  }, [darkMode]);

  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <GoogleOAuthProvider clientId="733096536847-fr419pjj6ev3rm5kb273gog2gctfmg9s.apps.googleusercontent.com">
    <div className={'login-wrapper'} style={{backgroundImage: `url(${bgResource})`}}>
      <div className="login-block zoom-in">
        <div className="form-block">
          <img src={tenantLogo ? tenantLogo : logo} alt="Logo" className={'logo'} />
          <Suspense fallback={<LoadingIndicator visible={true} overlay />}>
            <Outlet />
          </Suspense>
          <span className={'version-info'}>Geek Advice v{Package.version}</span>
        </div>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
};

export default GuestLayout;
