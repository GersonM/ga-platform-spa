import React, {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {Modal} from 'antd';
import axios from 'axios';

import './App.less';
import Login from '../Authentication/Screen/Login';
import AuthenticatedLayout from './AuthenticatedLayout';
import CompanyContainers from '../FileManagement/Screens/CompanyContainers';
import DashboardHome from '../Dashboard/Screens/DashboardHome';
import CommercialClients from '../Commercial/Screens/CommercialClients';
import InboxManager from '../InboxManagement/Screens/InboxManager';
import MailMessagesViewer from '../InboxManagement/Screens/InboxManager/MailMessagesViewer';
import MailAccountStats from '../InboxManagement/Screens/InboxManager/MailAccountStats';
import ModuleConfiguration from '../ConfigManagement/Screens/ModuleConfiguration';
import ConfigOptions from '../InboxManagement/Screens/ConfigOptions';
import Users from '../AccountManagement/Screens/Users';
import FileDetailViewer from '../FileManagement/Screens/FileDetailViewer';
import Invoices from '../PaymentManagement/Screens/Invoices';
import PreferencesManager from '../Preferences/Screens/PreferencesManager';
import GuestLayout from './GuestLayout';
import PasswordRecovery from '../Authentication/Screen/PasswordRecovery';
import VerifyRecovery from '../Authentication/Screen/VerifyRecovery';
import PermissionsManager from '../Authentication/Screen/PermissionsManager';
import MoveLayout from '../MoveManagement/Screens/MoveLayout';
import MoveRoutesManager from '../MoveManagement/Screens/MoveRoutesManager';
import MoveVehiclesManager from '../MoveManagement/Screens/MoveVehiclesManager';
import TicketsManager from '../MoveManagement/Screens/TicketsManager';
import TripReservation from '../MoveManagement/Screens/TripReservation';
import TaxonomyManager from '../TaxonomyManagement/Screens/TaxonomyManager';
import HRManagementLayout from '../HRManagement/Screens/HRManagementLayout';
import TripsSchedule from '../MoveManagement/Screens/TripsSchedule';
import DocumentGeneratorScreen from '../HRManagement/Screens/DocumentGeneratorScreen';
import CommercialContractDetail from '../Commercial/Screens/CommercialContractDetail';
import ReservationsLayout from '../ReservationsManagement/Screens/ReservationsLayout';
import NewReservation from '../ReservationsManagement/Screens/NewReservation';
import ReservationsManager from '../ReservationsManagement/Screens/ReservationsManager';
import CoursesManagement from '../LMSManagement/Screens/CoursesManagement';
import CommercialIncidents from '../Commercial/Screens/CommercialIncidents';
import EnrollmentsManagement from '../LMSManagement/Screens/EnrollmentsManagement';
import CommercialLeads from '../Commercial/Screens/CommercialLeads';
import CourseDetail from '../LMSManagement/Screens/CourseDetail';
import MyTasks from '../EntityActivity/Screens/MyTasks';
import EstatesManager from '../RealEstate/Screens/EstatesManager';
import RealEstateDashboard from '../RealEstate/Screens/RealEstateDashboard';
import EstateDetailView from '../RealEstate/Screens/EstateDetailView';
import CommercialDashboard from '../Commercial/Screens/CommercialDashboard';
import EstateProvinding from '../RealEstate/Screens/EstateProvinding';

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
            if (window.location.pathname.indexOf('/auth/login') === -1) {
              //window.location.href = '/auth/login';
            }
            return Promise.reject(error);
          default:
            return Promise.reject(error);
        }
      }
    });
  }, []);

  return (
    <Routes>
      <Route path={'/auth'} element={<GuestLayout />}>
        <Route path={'login'} element={<Login />} />
        <Route path={'recover'} element={<PasswordRecovery />} />
        <Route path={'verify-recovery'} element={<VerifyRecovery />} />
      </Route>
      <Route path={'/storage/files/:uuid'} element={<FileDetailViewer />} />
      <Route path={'/'} element={<AuthenticatedLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path={'/my-tasks'} element={<MyTasks />} />
        <Route path={'file-management'} element={<CompanyContainers />}>
          <Route path={':uuid'} element={<CompanyContainers />} />
          <Route path={':uuid/containers/:child_uuid'} element={<CompanyContainers />} />
        </Route>
        <Route path={'inbox-management'} element={<InboxManager />}>
          <Route path={'storage/:uuid'} element={<MailAccountStats />} />
          <Route path={':account/:uuid/:message?'} element={<MailMessagesViewer />}>
            <Route path={':tab'} />
          </Route>
        </Route>
        <Route path={'accounts'} element={<Users />}>
          <Route path={':uuid'}>
            <Route path={':tab'} />
          </Route>
        </Route>
        <Route path={'invoices'} element={<Invoices />}>
          <Route path={':uuid'} />
        </Route>
        <Route path={'config'} element={<ModuleConfiguration />}>
          <Route path={'inbox-management'} element={<ConfigOptions />}>
            <Route path={':tab'} element={null} />
          </Route>
          <Route path={'preferences'} element={<PreferencesManager />} />
          <Route path={'permissions'} element={<PermissionsManager />} />
          <Route path={'taxonomy'} element={<TaxonomyManager />}>
            <Route path={':taxonomy'} element={null} />
          </Route>
        </Route>
        <Route path={'move'} element={<MoveLayout />}>
          <Route path={'reservation'} element={<TripReservation />} />
          <Route path={'trips'} element={<TicketsManager />} />
          <Route path={'routes'} element={<MoveRoutesManager />} />
          <Route path={'vehicles'} element={<MoveVehiclesManager />} />
          <Route path={'schedule'} element={<TripsSchedule />} />
        </Route>
        <Route path={'lms'}>
          <Route path={'courses'} element={<CoursesManagement />} />
          <Route path={'courses/:course'} element={<CourseDetail />} />
          <Route path={'students'} element={<EnrollmentsManagement />} />
        </Route>
        <Route path={'reservations'} element={<ReservationsLayout />}>
          <Route path={'create'} element={<NewReservation />} />
          <Route path={'manager'} element={<ReservationsManager />} />
          <Route path={'routes'} element={<MoveRoutesManager />} />
          <Route path={'vehicles'} element={<MoveVehiclesManager />} />
          <Route path={'schedule'} element={<TripsSchedule />} />
        </Route>
        <Route path={'hr'} element={<HRManagementLayout />}>
          <Route path={'document-generator'} element={<DocumentGeneratorScreen />} />
          <Route path={':uuid'}>
            <Route path={':tab'} />
          </Route>
        </Route>
        <Route path={'commercial'}>
          <Route path={'dashboard'} element={<CommercialDashboard />} />
          <Route path={'incidents'} element={<CommercialIncidents />} />
          <Route path={'leads/:campaign?'} element={<CommercialLeads />} />
          <Route path={'clients'} element={<CommercialClients />} />
          <Route path={'contracts/:contract'} element={<CommercialContractDetail />} />
          <Route path={'payments'} element={<CommercialClients />} />
          <Route path={'sales'} element={<EstateProvinding />} />
        </Route>
        <Route path={'real-estate'}>
          <Route path={'dashboard'} element={<RealEstateDashboard />} />
          <Route path={'estates'} element={<EstatesManager />} />
          <Route path={'estates/:state?'} element={<EstateDetailView />} />
          <Route path={'providing'} element={<EstateProvinding />} />
        </Route>
        <Route
          path={'*'}
          element={
            <div style={{padding: 30}}>
              <h1>Error 404</h1>
              <p>No content available under this view</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
