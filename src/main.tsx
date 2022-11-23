import 'antd/dist/antd.variable.less';

import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {ConfigProvider} from 'antd';

import App from './App/App';
import './index.less';
import {AuthContextProvider} from './Context/AuthContext';

const tenantID = window.location.hostname.split('.')[0];
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API;
axios.defaults.headers.common['X-Tenant'] = 'demo'; //tenantID;

axios
  .get('/version')
  .then(response => {
    ConfigProvider.config({
      theme: {
        primaryColor: response.data.config.color,
      },
    });

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <ConfigProvider>
        <AuthContextProvider config={response.data.config}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthContextProvider>
      </ConfigProvider>,
    );
  })
  .catch(() => {
    const el = document.getElementById('root');
    if (el) {
      el.textContent = 'No client information, please check your email and go to your default configuration';
    }
  });
