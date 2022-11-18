import React, {useContext, useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {Modal} from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';

import './App.less';
import AuthContext from '../Context/AuthContext';
import ErrorHandler from '../Utils/ErrorHandler';
import Login from '../Authentication/Screen/Login';
import AppAuthenticated from './AppAuthenticated';
import CompanyContainers from '../FileManagement/Screens/CompanyContainers';
import DashboardHome from '../Dashboard/Screens/DashboardHome';
import CommercialHome from '../Commercial/Screens/CommercialHome';
import VideoDashboardScreen from '../Modules/Video/Screens/VideoDashboardScreen';

const token = Cookies.get('session_token');

const App = () => {
  const {setUser} = useContext(AuthContext);

  useEffect(() => {
    if (setUser) {
      if (!token) {
        if (window.location.pathname.indexOf('/login') === -1) {
          window.location.href = '/login';
        }
        return;
      }

      axios.defaults.baseURL = import.meta.env.VITE_API;
      axios.defaults.headers.common.Authorization = 'Bearer ' + token;
      axios.interceptors.response.use(undefined, error => {
        console.error('Global error: ' + error.message);
        if (error.message === 'Network Error') {
          Modal.error({
            icon: <span className="icon-cloud-crossed" style={{fontSize: 30}} />,
            title: 'Network error',
            centered: true,
            content: "Can't reach the service, please check your connection and try again",
          });
        }

        if (error.message !== 'Network Error' && error.response) {
          switch (error.response.status) {
            case 401:
              if (window.location.pathname.indexOf('/login') === -1) {
                window.location.href = '/login';
              }
              break;
            default:
              return Promise.reject(error);
          }
        }
      });

      axios
        .get('/authentication/session')
        .then(userResponse => {
          if (userResponse) {
            setUser(userResponse.data);
          } else {
            if (window.location.pathname.indexOf('/login') === -1) {
              //window.location.href = '/login';
            }
          }
        })
        .catch(error => {
          ErrorHandler.showNotification(error);
        });
    }
  }, [setUser]);

  return (
    <Routes>
      <Route path={'/login'} element={<Login />} />
      <Route path={'/'} element={<AppAuthenticated />}>
        <Route index element={<DashboardHome />} />
        <Route path={'file-management/'} element={<CompanyContainers />} />
        <Route path={'file-management/containers/:uuid'} element={<CompanyContainers />} />
        <Route path={'commercial/*'} element={<CommercialHome />} />
        <Route path={'video/*'} element={<VideoDashboardScreen />} />
      </Route>
    </Routes>
  );
};

export default App;
