import React from 'react';
import {Outlet} from 'react-router-dom';
import {MapPinIcon, TicketIcon, TruckIcon, UsersIcon} from '@heroicons/react/24/solid';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import ModuleContent from '../../../CommonUI/ModuleContent';
import {BsListStars} from 'react-icons/bs';

const MoveLayout = () => {
  return (
    <>
      <ModuleSidebar title={'Transporte'}>
        <NavList>
          <NavListItem icon={<TicketIcon />} name={'Nueva reserva'} path={'/move/reservation'} />
          <NavListItem icon={<BsListStars />} name={'Mis reservas'} path={'/move/trips'} />
          <NavListItem icon={<i className={'icon-bus'} />} name={'Vehículos & conductores'} path={'/move/vehicles'} />
          <NavListItem icon={<MapPinIcon />} name={'Rutas & lugares'} path={'/move/routes'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default MoveLayout;
