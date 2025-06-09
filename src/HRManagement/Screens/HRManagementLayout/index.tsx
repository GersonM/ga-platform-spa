
import {Outlet} from 'react-router-dom';
import {BuildingOffice2Icon, DocumentPlusIcon, MapPinIcon, UserPlusIcon, UsersIcon} from '@heroicons/react/24/solid';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import ModuleContent from '../../../CommonUI/ModuleContent';

const HRManagementLayout = () => {
  return (
    <>
      <ModuleSidebar title={'Recursos Humanos'}>
        <NavList>
          <NavListItem icon={<UserPlusIcon />} name={'Reclutamiento'} path={'/hr/reservation'} />
          <NavListItem icon={<UsersIcon />} name={'Empleados'} path={'/hr/reservation'} />
          <NavListItem icon={<BuildingOffice2Icon />} name={'Empresas'} path={'/hr/trips'} />
          <NavListItem icon={<MapPinIcon />} name={'Reportes'} path={'/hr/dashboard'} />
          <NavListItem icon={<DocumentPlusIcon />} name={'Generador de documentos'} path={'/hr/document-generator'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default HRManagementLayout;
