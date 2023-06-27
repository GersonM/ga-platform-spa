import React, {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {Modal} from 'antd';
import axios from 'axios';

import './App.less';
import Login from '../Authentication/Screen/Login';
import AppAuthenticated from './AppAuthenticated';
import CompanyContainers from '../FileManagement/Screens/CompanyContainers';
import DashboardHome from '../Dashboard/Screens/DashboardHome';
import CommercialHome from '../Commercial/Screens/CommercialHome';
import ListEmailAccounts from '../EmailManager/Screens/ListEmailAccounts';
import MailAccountInformation from '../EmailManager/Components/MailAccountInformation';

const App = () => {
  useEffect(() => {
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
  }, []);

  return (
    <Routes>
      <Route path={'/login'} element={<Login />} />
      <Route path={'/'} element={<AppAuthenticated />}>
        <Route index element={<DashboardHome />} />
        <Route path={'file-management'} element={<CompanyContainers />}>
          <Route path={':uuid'} element={<CompanyContainers />} />
          <Route path={':uuid/containers/:child_uuid'} element={<CompanyContainers />} />
        </Route>
        <Route path={'mail-management'} element={<ListEmailAccounts />}>
          <Route path={'accounts/:uuid'}>
            <Route path={':tab'} />
          </Route>
        </Route>
        <Route path={'commercial/*'} element={<CommercialHome />} />
      </Route>
    </Routes>
  );
};

export default App;
