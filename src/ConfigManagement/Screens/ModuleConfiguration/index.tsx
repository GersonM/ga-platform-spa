import {Suspense} from 'react';
import {Outlet} from 'react-router-dom';
import {TbBrush, TbMailbox, TbServerCog, TbShieldCheck, TbSpaces, TbTagStarred} from 'react-icons/tb';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

const ModuleConfiguration = () => {
  return (
    <>
      <ModuleSidebar title={'Configuración de módulos'}>
        <NavList>
          <NavListItem icon={<TbSpaces />} name={'Workspaces'} path={'/config/workspaces'} />
          <NavListItem icon={<TbServerCog />} name={'Almacenamiento'} path={'/config/file-management'} />
          <NavListItem icon={<TbMailbox />} name={'E-mail'} path={'/config/inbox-management'} />
          <NavListItem icon={<TbBrush />} name={'Preferencias'} path={'/config/preferences'} />
          <NavListItem icon={<TbShieldCheck />} name={'Roles y permisos'} path={'/config/permissions'} />
          <NavListItem icon={<TbTagStarred />} name={'Taxonomías'} path={'/config/taxonomy'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent withSidebar>
        <Suspense fallback={<LoadingIndicator />}>
          <Outlet />
        </Suspense>
      </ModuleContent>
    </>
  );
};

export default ModuleConfiguration;
