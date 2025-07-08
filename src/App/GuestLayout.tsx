import {Suspense, useContext, useEffect, useState} from 'react';
import {Outlet} from 'react-router-dom';
//import { createClient } from 'pexels';

import logo from './../Assets/ga_logo.webp';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import LoadingIndicator from '../CommonUI/LoadingIndicator';
import './GuestLayout.less';
const key = 'KcEke7cCtNBvgokFMxxhW2YUuV2AX3rrNVPyIyTo48Dwi7Accj2SRZjm';
//const client = createClient(key);

const GuestLayout = () => {
  const {config, darkMode} = useContext(AuthContext);
  const [bgResource, setBgResource] = useState<string>();

  /*useEffect(() => {
    client.photos.random().then((res: any) => {
      setBgResource(res?.src?.landscape);
    })
  }, []);*/

  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <div className={'login-wrapper'} >
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
