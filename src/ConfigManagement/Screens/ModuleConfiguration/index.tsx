import {Suspense} from 'react';
import {Outlet} from 'react-router-dom';
import {
  TbBrush,
  TbDatabaseEdit,
  TbMailbox,
  TbServerCog,
  TbShieldCheck,
  TbSoccerField,
  TbSpaces,
  TbTagStarred
} from 'react-icons/tb';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import {GoogleOAuthProvider} from "@react-oauth/google";

const ModuleConfiguration = () => {
  return (
    <GoogleOAuthProvider clientId="733096536847-fr419pjj6ev3rm5kb273gog2gctfmg9s.apps.googleusercontent.com">
      <ModuleSidebar title={'Configuración de módulos'}>
        <NavList>
          <NavListItem icon={<TbSpaces />} name={'Workspaces'} path={'/config/workspaces'} />
          <NavListItem icon={<TbServerCog />} name={'Almacenamiento'} path={'/config/file-management'} />
          <NavListItem icon={<TbMailbox />} name={'E-mail'} path={'/config/inbox-management'} />
          <NavListItem icon={<TbBrush />} name={'Preferencias'} path={'/config/preferences'} />
          <NavListItem icon={<TbShieldCheck />} name={'Roles y permisos'} path={'/config/permissions'} />
          <NavListItem icon={<TbTagStarred />} name={'Taxonomías'} path={'/config/taxonomy'} />
          <NavListItem icon={<TbDatabaseEdit />} name={'Tipos de datos'} path={'/config/fields'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent withSidebar>
        <Suspense fallback={<LoadingIndicator />}>
          <Outlet />
        </Suspense>
      </ModuleContent>
    </GoogleOAuthProvider>
  );
};

export default ModuleConfiguration;
