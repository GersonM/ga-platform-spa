import {Suspense, useContext, useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';
import {GoogleOAuthProvider} from '@react-oauth/google';

import logo from './../Assets/ga_logo.webp';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import LoadingIndicator from '../CommonUI/LoadingIndicator';
import './GuestLayout.less';

const key = 'KcEke7cCtNBvgokFMxxhW2YUuV2AX3rrNVPyIyTo48Dwi7Accj2SRZjm';

const GuestLayout = () => {
  const {config, darkMode} = useContext(AuthContext);
  const [bgResource, setBgResource] = useState<string>();
  const [imageInfo, setImageInfo] = useState<any>();

  useEffect(() => {
    const query = 'peru arequipa city ' + (darkMode ? 'night' : 'day');
    fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=15&page=${(Math.random() * 100).toFixed(0)}`,
      {headers: {Authorization: key,}},
    ).then((response) => {
      response.json().then(data => {
        const random = Math.floor(Math.random() * data.photos.length);
        setBgResource(data?.photos[random].src?.large2x);
        setImageInfo(data?.photos[random]);
      });
    });
  }, [darkMode]);

  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <GoogleOAuthProvider clientId="733096536847-fr419pjj6ev3rm5kb273gog2gctfmg9s.apps.googleusercontent.com">
      <div className="auth-wrapper">
        <div className="auth-block zoom-in">
          <div className="form-block">
            <img src={tenantLogo ? tenantLogo : logo} alt="Logo" className={'logo'}/>
            <Suspense fallback={<LoadingIndicator visible={true} overlay/>}>
              <Outlet/>
            </Suspense>
          </div>
        </div>
        <code className={'version-info'}>
          <a href="https://geekadvice.pe" target={'_blank'}>
            <img src={logo} className={'logo'} alt="Geek Advice Platform"/>
            v{Package.version}
          </a>
        </code>
        <div className="login-image" style={{backgroundImage: `url(${bgResource})`}}>
          <cite>Por {imageInfo?.photographer} <br/>
            <small>{imageInfo?.alt}</small></cite>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default GuestLayout;
