import React, {useContext, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {Avatar, Dropdown, Popover, Progress, Space} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import axios from 'axios';
import {
  PiBooksLight,
  PiBoxArrowUp,
  PiBuildingsLight,
  PiBulldozerLight,
  PiCalendarCheckLight,
  PiCarLight,
  PiCarProfile,
  PiCashRegister,
  PiClockUser,
  PiDoorOpenLight,
  PiDotsThreeVerticalBold,
  PiFingerprint,
  PiGear,
  PiGraduationCap,
  PiHandshake,
  PiHardDrives,
  PiInvoiceDuotone,
  PiMailboxDuotone,
  PiPackageLight,
  PiPresentationChart,
  PiSquaresFour,
  PiStudent,
  PiUserFocus,
  PiUsers,
  PiUsersThree,
  PiVectorThreeLight,
  PiWarningDiamond,
} from 'react-icons/pi';
import {BellIcon, CalendarIcon, MapPinIcon, QueueListIcon, TicketIcon} from '@heroicons/react/24/outline';

import ScreenModeSelector from './ScreenModeSelector';
import logo from '../Assets/logo_square.png';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import ErrorHandler from '../Utils/ErrorHandler';
import UploadInformation from '../FileManagement/Components/UploadInformation';
import NavItem from './NavItem';
import './styles.less';
import {TbBuildingEstate} from 'react-icons/tb';
import {FaChalkboardTeacher} from 'react-icons/fa';
import {GoTasklist} from 'react-icons/go';

const menuItems: ItemType[] = [
  {
    label: 'Mi cuenta',
    key: 'account',
    disabled: true,
  },
  {
    label: 'Favoritos',
    key: 'favorites',
  },
  {
    label: 'Cerrar sesión',
    key: 'logout',
  },
];

const Navigation = () => {
  const {uploadProgress, user, logout, config, darkMode, setOpenMenu, openMenu, activityCount} =
    useContext(AuthContext);
  const {pathname} = useLocation();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  const getFavorites = () => {
    axios
      .get(`hr-management/profiles/${user?.profile.uuid}/favorites`)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const handleUserMenuClick = (item: any) => {
    console.log(item.key);
    switch (item.key) {
      case 'logout':
        logout().then();
        break;
      case 'favorites':
        getFavorites();
        break;
    }
  };

  const navLogo = darkMode ? config?.dark_logo : config?.dark_logo;

  return (
    <div className={`navigation-wrapper ${openMenu ? 'open' : ''}`}>
      <div className={'head'}>
        <div
          className="logo-square"
          onClick={() => {
            setOpenMenu(!open);
          }}>
          <img src={navLogo || logo} alt="Logo" />
        </div>
      </div>
      <nav>
        <ul className="navigation-list">
          <NavItem label={'Dashboard'} icon={<PiSquaresFour />} path={'/'} />
          <NavItem
            label={'Mis tareas'}
            icon={<GoTasklist />}
            path={'/my-tasks'}
            notifications={activityCount?.pending}
          />
          {config?.modules.includes('files') && (
            <NavItem label={'Gestor de Archivos'} icon={<PiHardDrives />} path={'/file-management'} />
          )}
          {config?.modules.includes('real-estate') && (
            <NavItem label={'Constructora'} icon={<PiBulldozerLight />}>
              <NavItem icon={<PiPresentationChart />} label={'Dashboard'} path={'/real-estate/dashboard'} />
              <NavItem icon={<PiBuildingsLight />} label={'Propiedades'} path={'/real-estate/estates'} />
              <NavItem icon={<PiVectorThreeLight />} label={'Proyectos'} path={'/real-estate/projects'} />
              <NavItem icon={<PiDoorOpenLight />} label={'Entregas'} path={'/real-estate/providing'} />
            </NavItem>
          )}
          {config?.modules.includes('commercial') && (
            <NavItem label={'Comercial'} icon={<PiHandshake />}>
              <NavItem icon={<PiPresentationChart />} label={'Dashboard'} path={'/commercial/dashboard'} />
              <NavItem icon={<PiWarningDiamond />} label={'Incidencias'} path={'/commercial/incidents'} />
              <NavItem icon={<PiUserFocus />} label={'Leads'} path={'/commercial/leads'} />
              {(user?.roles?.includes('admin') || user?.roles?.includes('Cajero')) && (
                <>
                  <NavItem icon={<PiUsers />} label={'Clientes'} path={'/commercial/clients'} />
                  <NavItem icon={<PiInvoiceDuotone />} label={'Pagos'} path={'/commercial/payments'} />
                  <NavItem icon={<PiBoxArrowUp />} label={'Productos'} path={'/commercial/products'} />
                </>
              )}
            </NavItem>
          )}
          {config?.modules.includes('move') && (
            <NavItem icon={<PiCarProfile />} label={'Transporte'}>
              <NavItem icon={<TicketIcon />} label={'Nueva reserva'} path={'/move/reservation'} />
              <NavItem icon={<QueueListIcon />} label={'Mis reservas'} path={'/move/trips'} />
              {user?.roles?.includes('admin') && (
                <>
                  <NavItem
                    icon={<PiCarLight className={'icon'} />}
                    label={'Vehículos & conductores'}
                    path={'/move/vehicles'}
                  />
                  <NavItem icon={<MapPinIcon />} label={'Rutas & lugares'} path={'/move/routes'} />
                </>
              )}
              <NavItem icon={<CalendarIcon />} label={'Calendario'} path={'/move/schedule'} />
            </NavItem>
          )}
          {config?.modules.includes('reservations') && (
            <NavItem icon={<PiCalendarCheckLight />} label={'Reservas'}>
              <NavItem icon={<TicketIcon />} label={'Nueva reserva'} path={'/reservations/create'} />
              <NavItem icon={<QueueListIcon />} label={'Reservas'} path={'/reservations/manager'} />
              {user?.roles?.includes('admin') && (
                <>
                  <NavItem
                    icon={<TbBuildingEstate className={'icon'} />}
                    label={'Espacios'}
                    path={'/reservations/vehicles'}
                  />
                  <NavItem icon={<MapPinIcon />} label={'Servicios'} path={'/reservations/routes'} />
                </>
              )}
              <NavItem icon={<CalendarIcon />} label={'Calendario'} path={'/move/schedule'} />
            </NavItem>
          )}
          {user?.roles?.includes('hr') && <NavItem label={'RR. HH.'} icon={<PiUsersThree />} path={'/hr'} />}
          {user?.roles?.includes('admin') && (
            <NavItem label={'Seguridad'} icon={<PiFingerprint />} path={'/accounts'} />
          )}
          {config?.modules.includes('lms') && (
            <NavItem label={'LMS'} icon={<PiGraduationCap />}>
              <NavItem label={'Cursos'} icon={<PiBooksLight />} path={'/lms/courses'} />
              <NavItem label={'Estudiantes'} icon={<PiStudent />} path={'/lms/students'} />
              <NavItem label={'Profesores'} icon={<FaChalkboardTeacher />} path={'/lms/teachers'} />
            </NavItem>
          )}

          {config?.modules.includes('attendance') && (
            <NavItem label={'Asistencia'} icon={<PiClockUser />} path={'/attendance'} />
          )}
          {config?.modules.includes('inbox') && (
            <NavItem label={'E-mail'} icon={<PiMailboxDuotone />} path={'/inbox-management'} />
          )}
          {config?.modules.includes('payments') && (
            <NavItem label={'Pagos'} icon={<PiCashRegister />} path={'/invoices'} />
          )}
          {user?.roles?.includes('admin') && <NavItem label={'Configuración'} icon={<PiGear />} path={'/config'} />}
        </ul>
      </nav>
      <div className="bottom-nav">
        {uploadProgress && (
          <Popover
            placement={'right'}
            content={
              <>
                <h3>Cargas</h3>
                <UploadInformation />
              </>
            }>
            <Progress type={'circle'} size={30} percent={100} style={{marginBottom: '10px'}}>
              <UploadOutlined />
            </Progress>
          </Popover>
        )}
        <Space>
          <div className={'user-tool'}>
            <BellIcon />
          </div>
          <ScreenModeSelector />
        </Space>
        <Dropdown
          arrow={true}
          placement={'topLeft'}
          trigger={['click']}
          menu={{items: menuItems, onClick: handleUserMenuClick}}>
          <div className={'user-menu'}>
            <Avatar className={'avatar'}>{user?.name.substring(0, 1)}</Avatar>
            <div>
              {user?.profile.name}
              <small>{user?.profile.email}</small>
            </div>
            <PiDotsThreeVerticalBold size={20} />
          </div>
        </Dropdown>
      </div>
      <div className={'version-info'}>v{Package.version}</div>
    </div>
  );
};

export default Navigation;
