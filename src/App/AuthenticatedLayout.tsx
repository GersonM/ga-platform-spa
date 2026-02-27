import {Suspense, useContext} from 'react';
import {Outlet} from 'react-router-dom';
import Navigation from '../Navigation';
import AuthContext from '../Context/AuthContext';
import LoadingIndicator from '../CommonUI/LoadingIndicator';
import UploadInformation from "../FileManagement/Components/UploadInformation";
import {Toaster} from "sileo";

const AuthenticatedLayout = () => {
  const {user, sessionToken, openMenu, setOpenMenu, darkMode} = useContext(AuthContext);

  if (!user) {
    if (!sessionToken) {
      window.location.href = '/auth/login';
    }
    return null;
  }

  return (
    <>
      <Toaster position="top-right" theme={darkMode ? 'dark' : 'light'}/>
      <Navigation/>
      <div className="app-content">
        <Suspense fallback={<LoadingIndicator/>}>
          <Outlet/>
        </Suspense>
        <UploadInformation/>
      </div>
      {openMenu && (
        <div
          className={'module-nav-overlay'}
          onClick={() => {
            setOpenMenu(!openMenu);
          }}
        />
      )}
    </>
  );
};

export default AuthenticatedLayout;
