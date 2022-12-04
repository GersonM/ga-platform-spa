import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import 'antd/dist/reset.css';

import './index.less';
import {AuthContextProvider} from './Context/AuthContext';
import App from './App/App';
import TenantAppConfig from './Context/TenantAppConfig';

const tenantID = window.location.hostname.split('.')[0];
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API;
axios.defaults.headers.common['X-Tenant'] = tenantID;

axios
  .get('/version')
  .then(response => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <AuthContextProvider config={response.data.config}>
        <TenantAppConfig tenant={response.data.config}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TenantAppConfig>
      </AuthContextProvider>,
    );
  })
  .catch(() => {
    const el = document.getElementById('root');
    if (el) {
      el.innerHTML =
        '<div class="error-name">Este cliente aún no está activo o no ha sido registrado<br/> <small>Revisa tu correo para saber el estado de tu cuenta</small></div>';
    }
  });
