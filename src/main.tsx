import axios from 'axios';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import 'dayjs/locale/es.js';
import 'antd/dist/reset.css';
import 'overlayscrollbars/overlayscrollbars.css';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import '@ant-design/v5-patch-for-react-19';
import {EditorProvider} from "react-simple-wysiwyg";
import {configureEcho} from "@laravel/echo-react";

import {AuthContextProvider} from './Context/AuthContext';
import {UploadContextProvider} from './Context/UploadContext';
import TenantAppConfig from './Context/TenantAppConfig';
import App from './App/App';
import logo from './Assets/ga_logo.webp';
import './index.less';

dayjs.locale('es');
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Lima")

const token = Cookies.get('session_token');
const selectedWorkspace = Cookies.get('workspace');
const isDevMode = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168');
let tenantID = selectedWorkspace ? selectedWorkspace : isDevMode ? import.meta.env.VITE_CODE : window.location.hostname.split('.')[0];

if (window.location.hostname.includes('countryclublavilla.pe')) {
  tenantID = 'country-moquegua';
}
if (window.location.hostname.includes('cobrify.lat')) {
  tenantID = 'cobrify';
}

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API;
axios.defaults.headers.common['X-Tenant'] = tenantID;
axios.defaults.headers.common.Authorization = 'Bearer ' + token;
axios.defaults.withXSRFToken = true;

function detectBrowser() {
  if (navigator.userAgent.includes("Chrome")) {
    return "chrome"
  }
  if (navigator.userAgent.includes("Firefox")) {
    return "firefox"
  }
  if (navigator.userAgent.includes("Safari")) {
    return "safari"
  }
}
const browser = detectBrowser();
if(browser) {
  document.body.classList.add(browser);
}


configureEcho({
  broadcaster: "reverb",
  auth: {headers: {'X-Tenant': tenantID}},
  authEndpoint: 'https://'+import.meta.env.VITE_REVERB_HOST + '/broadcasting/auth ',
  bearerToken: token,
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  wssPort: import.meta.env.VITE_REVERB_PORT,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});

axios
  .get('/version')
  .then(response => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <AuthContextProvider config={response.data}>
        <TenantAppConfig tenant={response.data}>
          <UploadContextProvider>
            <BrowserRouter future={{v7_relativeSplatPath: true, v7_startTransition: false}}>
              <EditorProvider>
                <App/>
              </EditorProvider>
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
        `<div class="error-name"><img src=${logo} alt={"Logo"}/>La cuenta no se encuentra activa<br/> <span>Revisa tu correo para saber el estado de tu cuenta</span></div>`;
    }
  });
