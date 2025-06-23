import {Suspense, useContext} from 'react';
import {Outlet} from 'react-router-dom';
import Navigation from '../Navigation';
import AuthContext from '../Context/AuthContext';
import LoadingIndicator from '../CommonUI/LoadingIndicator';
import UploadInformation from "../FileManagement/Components/UploadInformation";

const AuthenticatedLayout = () => {
  const {user, sessionToken} = useContext(AuthContext);
  const {openMenu, setOpenMenu} = useContext(AuthContext);

  if (!user) {
    if (!sessionToken) {
      window.location.href = '/auth/login';
    }
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="app-content">
        <Suspense fallback={<LoadingIndicator />}>
          <Outlet />
        </Suspense>
        <UploadInformation />
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
