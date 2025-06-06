import React, {Suspense} from 'react';
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
          <NavListItem icon={<TbSpaces size={22} />} name={'Workspaces'} path={'/config/workspaces'} />
          <NavListItem icon={<TbServerCog size={22} />} name={'Almacenamiento'} path={'/config/file-management'} />
          <NavListItem icon={<TbMailbox size={22} />} name={'E-mail'} path={'/config/inbox-management'} />
          <NavListItem icon={<TbBrush size={22} />} name={'Preferencias'} path={'/config/preferences'} />
          <NavListItem icon={<TbShieldCheck size={22} />} name={'Roles y permisos'} path={'/config/permissions'} />
          <NavListItem icon={<TbTagStarred size={22} />} name={'Taxonomías'} path={'/config/taxonomy'} />
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
