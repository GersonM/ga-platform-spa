import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import 'antd/dist/reset.css';

import './index.less';
import {AuthContextProvider} from './Context/AuthContext';
import App from './App/App';
import AntConfig from './Context/AntConfig';

const tenantID = window.location.hostname.split('.')[0];
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API;
axios.defaults.headers.common['X-Tenant'] = 't1'; //tenantID;

axios
  .get('/version')
  .then(response => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <AuthContextProvider config={response.data.config}>
        <AntConfig color={response.data.config.color}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AntConfig>
      </AuthContextProvider>,
    );
  })
  .catch(() => {
    const el = document.getElementById('root');
    if (el) {
      el.innerHTML =
        '<div class="error-name">Este cliente no está activo o aún no está registra  <br/> <small>Por favor revisar tu correo para saber </small></div>';
    }
  });
