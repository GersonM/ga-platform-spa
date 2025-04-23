import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/es.js';
import 'antd/dist/reset.css';
import 'overlayscrollbars/overlayscrollbars.css';
import relativeTime from 'dayjs/plugin/relativeTime';

import {AuthContextProvider} from './Context/AuthContext';
import {UploadContextProvider} from './Context/UploadContext';
import TenantAppConfig from './Context/TenantAppConfig';
import App from './App/App';
import './index.less';

dayjs.locale('es');
dayjs.extend(relativeTime);

const token = Cookies.get('session_token');
const isDevMode = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168');
let tenantID = isDevMode ? 'villa' : window.location.hostname.split('.')[0];

if (window.location.hostname.includes('countryclublavilla.pe')) {
  tenantID = 'country-moquegua';
}

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API;
axios.defaults.headers.common['X-Tenant'] = tenantID;
axios.defaults.headers.common.Authorization = 'Bearer ' + token;
axios.defaults.withXSRFToken = true;

axios
  .get('/version')
  .then(response => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <AuthContextProvider config={response.data}>
        <TenantAppConfig tenant={response.data}>
          <UploadContextProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </UploadContextProvider>
        </TenantAppConfig>
      </AuthContextProvider>,
    );
  })
  .catch(() => {
    const el = document.getElementById('root');
    if (el) {
      el.innerHTML =
        '<div class="error-name">La cuenta no se encuentra activa<br/> <span>Revisa tu correo para saber el estado de tu cuenta</span></div>';
    }
  });
