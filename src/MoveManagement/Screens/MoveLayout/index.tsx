import React, {useContext} from 'react';
import {Outlet} from 'react-router-dom';
import {CalendarIcon, MapPinIcon, TicketIcon, TruckIcon, UsersIcon} from '@heroicons/react/24/solid';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import ModuleContent from '../../../CommonUI/ModuleContent';
import {BsListStars} from 'react-icons/bs';
import AuthContext from '../../../Context/AuthContext';

const MoveLayout = () => {
  const {user} = useContext(AuthContext);
  return (
    <>
      <ModuleSidebar title={'Transporte'}>
        <NavList>
          <NavListItem icon={<TicketIcon />} name={'Nueva reserva'} path={'/move/reservation'} />
          <NavListItem icon={<BsListStars />} name={'Mis reservas'} path={'/move/trips'} />
          {user?.roles?.includes('admin') && (
            <>
              <NavListItem
                icon={<i className={'icon-bus'} />}
                name={'Vehículos & conductores'}
                path={'/move/vehicles'}
              />
              <NavListItem icon={<MapPinIcon />} name={'Rutas & lugares'} path={'/move/routes'} />
            </>
          )}
          <NavListItem icon={<CalendarIcon />} name={'Calendario'} path={'/move/schedule'} />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default MoveLayout;
