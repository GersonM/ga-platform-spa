import React, {lazy, useContext, useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import {Modal} from 'antd';
import axios from 'axios';

import './App.less';
import AuthContext from '../Context/AuthContext';
import Login from '../Authentication/Screen/Login';
import AuthenticatedLayout from './AuthenticatedLayout';
import GuestLayout from './GuestLayout';

const CompanyContainers = lazy(() => import('../FileManagement/Screens/CompanyContainers'));
const DashboardHome = lazy(() => import('../Dashboard/Screens/DashboardHome'));
const CommercialClients = lazy(() => import('../Commercial/Screens/CommercialClients'));
const InboxManager = lazy(() => import('../InboxManagement/Screens/InboxManager'));
const MailMessagesViewer = lazy(() => import('../InboxManagement/Screens/InboxManager/MailMessagesViewer'));
const MailAccountStats = lazy(() => import('../InboxManagement/Screens/InboxManager/MailAccountStats'));
const MoveLayout = lazy(() => import('../MoveManagement/Screens/MoveLayout'));
const HRManagementLayout = lazy(() => import('../HRManagement/Screens/HRManagementLayout'));
const ReservationsLayout = lazy(() => import('../ReservationsManagement/Screens/ReservationsLayout'));
const ModuleConfiguration = lazy(() => import('../ConfigManagement/Screens/ModuleConfiguration'));
const ConfigOptions = lazy(() => import('../InboxManagement/Screens/ConfigOptions'));
const Users = lazy(() => import('../AccountManagement/Screens/Users'));
const FileDetailViewer = lazy(() => import('../FileManagement/Screens/FileDetailViewer'));
const Invoices = lazy(() => import('../PaymentManagement/Screens/Invoices'));
const PreferencesManager = lazy(() => import('../Preferences/Screens/PreferencesManager'));
const PasswordRecovery = lazy(() => import('../Authentication/Screen/PasswordRecovery'));
const VerifyRecovery = lazy(() => import('../Authentication/Screen/VerifyRecovery'));
const PermissionsManager = lazy(() => import('../Authentication/Screen/PermissionsManager'));
const MoveRoutesManager = lazy(() => import('../MoveManagement/Screens/MoveRoutesManager'));
const MoveVehiclesManager = lazy(() => import('../MoveManagement/Screens/MoveVehiclesManager'));
const TicketsManager = lazy(() => import('../MoveManagement/Screens/TicketsManager'));
const TripReservation = lazy(() => import('../MoveManagement/Screens/TripReservation'));
const TaxonomyManager = lazy(() => import('../TaxonomyManagement/Screens/TaxonomyManager'));
const TripsSchedule = lazy(() => import('../MoveManagement/Screens/TripsSchedule'));
const DocumentGeneratorScreen = lazy(() => import('../HRManagement/Screens/DocumentGeneratorScreen'));
const CommercialContractDetail = lazy(() => import('../Commercial/Screens/CommercialContractDetail'));
const NewReservation = lazy(() => import('../ReservationsManagement/Screens/NewReservation'));
const ReservationsManager = lazy(() => import('../ReservationsManagement/Screens/ReservationsManager'));
const CoursesManagement = lazy(() => import('../LMSManagement/Screens/CoursesManagement'));
const CommercialIncidents = lazy(() => import('../Commercial/Screens/CommercialIncidents'));
const EnrollmentsManagement = lazy(() => import('../LMSManagement/Screens/EnrollmentsManagement'));
const CommercialLeads = lazy(() => import('../Commercial/Screens/CommercialLeads'));
const CourseDetail = lazy(() => import('../LMSManagement/Screens/CourseDetail'));
const MyTasks = lazy(() => import('../EntityActivity/Screens/MyTasks'));
const EstatesManager = lazy(() => import('../RealEstate/Screens/EstatesManager'));
const RealEstateDashboard = lazy(() => import('../RealEstate/Screens/RealEstateDashboard'));
const EstateDetailView = lazy(() => import('../RealEstate/Screens/EstateDetailView'));
const CommercialDashboard = lazy(() => import('../Commercial/Screens/CommercialDashboard'));
const EstateProviding = lazy(() => import('../RealEstate/Screens/EstateProviding'));
const MyAccount = lazy(() => import('../AccountTools/Screens/MyAccount'));
const MembersAccessControl = lazy(() => import('../ClubManagement/Screens/MembersAccessControl'));
const ClubMembersManagement = lazy(() => import('../ClubManagement/Screens/ClubMembersManagement'));
const ClubSubscriptionViewer = lazy(() => import('../ClubManagement/Screens/ClubSubscriptionViewer'));
const FileManagerPreferences = lazy(() => import('../FileManagement/Screens/FileManagerPreferences'));
const ImportPayments = lazy(() => import('../ClubManagement/Screens/ImportPayments'));
const WarehouseProductsManager = lazy(() => import('../WarehouseManager/Screens/WarehouseProductsManager'));

const App = () => {
  const {user} = useContext(AuthContext);

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
              window.location.href = '/auth/login';
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
          <Route path={'file-management'} element={<FileManagerPreferences />} />
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
        <Route path={'club'}>
          <Route path={'access-control'} element={<MembersAccessControl />} />
          <Route path={'subscriptions'} element={<ClubMembersManagement />} />
          <Route path={'subscriptions/:subscription'} element={<ClubSubscriptionViewer />} />
          <Route path={'payments-import'} element={<ImportPayments />} />
        </Route>
        <Route path={'commercial'}>
          <Route path={'dashboard'} element={<CommercialDashboard />} />
          <Route path={'incidents'} element={<CommercialIncidents />} />
          <Route path={'leads/:campaign?'} element={<CommercialLeads />} />
          <Route path={'clients'} element={<CommercialClients />} />
          <Route path={'contracts/:contract'} element={<CommercialContractDetail />} />
          <Route path={'payments'} element={<CommercialClients />} />
          <Route path={'sales'} element={<EstateProviding />} />
          <Route path={'products'} element={<WarehouseProductsManager />} />
        </Route>
        <Route path={'real-estate'}>
          <Route path={'dashboard'} element={<RealEstateDashboard />} />
          <Route path={'estates'} element={<EstatesManager />} />
          <Route path={'estates/:state?'} element={<EstateDetailView />} />
          <Route path={'providing'} element={<EstateProviding />} />
        </Route>
        {user && <Route path={'my-account'} element={<MyAccount />} />}
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
