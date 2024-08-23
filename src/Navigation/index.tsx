import React, {useContext, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {Avatar, Dropdown, Popover, Progress, Space} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import {TbCashBanknote, TbMailStar} from 'react-icons/tb';
import {HiOutlineCog} from 'react-icons/hi';
import {IoApps} from 'react-icons/io5';
import axios from 'axios';

import './styles.less';
import logo from '../Assets/logo_square.png';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import ErrorHandler from '../Utils/ErrorHandler';
import UploadInformation from '../FileManagement/Components/UploadInformation';
import {
  PiCarLight,
  PiCarProfile,
  PiClockUser,
  PiGraduationCap,
  PiHandshakeLight,
  PiShieldCheck,
  PiUsersThree,
} from 'react-icons/pi';
import ScreenModeSelector from './ScreenModeSelector';
import {BellIcon, CalendarIcon, MapPinIcon, QueueListIcon, TicketIcon} from '@heroicons/react/24/outline';
import {BsDeviceHdd} from 'react-icons/bs';
import NavItem from './NavItem';

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
  const {uploadProgress, user, logout, config, darkMode, setOpenMenu, openMenu} = useContext(AuthContext);
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

  const navLogo = darkMode ? config?.dark_logo : config?.white_logo;

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
          <NavItem label={'Dashboard'} icon={<IoApps />} path={'/'} />
          {config?.modules.includes('files') && (
            <NavItem label={'Gestor de Archivos'} icon={<BsDeviceHdd />} path={'/file-management'} />
          )}
          <NavItem label={'Comercial'} icon={<PiHandshakeLight />} path={'/commercial'} />
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
          {user?.roles?.includes('hr') && <NavItem label={'RR. HH.'} icon={<PiUsersThree />} path={'/hr'} />}
          {user?.roles?.includes('admin') && (
            <NavItem label={'Seguridad'} icon={<PiShieldCheck />} path={'/accounts'} />
          )}
          {config?.modules.includes('lms') && <NavItem label={'LMS'} icon={<PiGraduationCap />} path={'/lms'} />}
          {config?.modules.includes('attendance') && (
            <NavItem label={'Asistencia'} icon={<PiClockUser />} path={'/attendance'} />
          )}
          {config?.modules.includes('inbox') && (
            <NavItem label={'E-mail'} icon={<TbMailStar />} path={'/inbox-management'} />
          )}
          {config?.modules.includes('payments') && (
            <NavItem label={'Pagos'} icon={<TbCashBanknote />} path={'/invoices'} />
          )}
          {user?.roles?.includes('admin') && <NavItem label={'Opciones'} icon={<HiOutlineCog />} path={'/config'} />}
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
          <div className={'avatar'}>
            <Avatar>{user?.name.substring(0, 1)}</Avatar>
            <div>
              {user?.profile.name}
              <small>{user?.profile.email}</small>
            </div>
          </div>
        </Dropdown>
      </div>
      <div className={'version-info'}>v{Package.version}</div>
    </div>
  );
};

export default Navigation;
