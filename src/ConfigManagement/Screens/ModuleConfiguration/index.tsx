import React from 'react';
import {Outlet} from 'react-router-dom';
import {EnvelopeIcon, PaintBrushIcon, ServerStackIcon} from '@heroicons/react/24/outline';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import NavList, {NavListItem} from '../../../CommonUI/NavList';

const ModuleConfiguration = () => {
  return (
    <>
      <ModuleSidebar title={'Configuración de módulos'}>
        <NavList>
          <NavListItem
            icon={<ServerStackIcon />}
            height={45}
            name={'Almacenamiento'}
            path={'/config/file-management'}
          />
          <NavListItem icon={<EnvelopeIcon />} height={45} name={'E-mail'} path={'/config/inbox-management'} />
          <NavListItem icon={<PaintBrushIcon />} height={45} name={'Preferencias'} path={'/config/preferences'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default ModuleConfiguration;
