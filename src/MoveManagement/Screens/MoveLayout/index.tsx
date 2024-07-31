import React from 'react';
import {Outlet} from 'react-router-dom';
import {MapPinIcon, TicketIcon, TruckIcon} from '@heroicons/react/24/solid';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import ModuleContent from '../../../CommonUI/ModuleContent';

const MoveLayout = () => {
  return (
    <>
      <ModuleSidebar title={'Transporte'}>
        <NavList>
          <NavListItem icon={<TicketIcon />} height={45} name={'Pasajes'} path={'/move/trips'} />
          <NavListItem icon={<TruckIcon />} height={45} name={'Vehículos & conductores'} path={'/move/vehicles'} />
          <NavListItem icon={<MapPinIcon />} height={45} name={'Rutas & lugares'} path={'/move/routes'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default MoveLayout;
