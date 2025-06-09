
import {Outlet} from 'react-router-dom';

import ModuleContent from '../../../CommonUI/ModuleContent';

const MoveLayout = () => {
  return (
    <>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default MoveLayout;
