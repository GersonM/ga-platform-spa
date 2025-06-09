import {Outlet} from 'react-router-dom';

import ModuleContent from '../../../CommonUI/ModuleContent';

const ReservationsLayout = () => {
  return (
    <>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default ReservationsLayout;
