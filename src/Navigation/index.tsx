import {useContext, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Avatar, Badge, Dropdown, notification, Space, Tooltip} from 'antd';
import axios from 'axios';
import {
  PiCalendarCheckLight,
  PiCaretUpDown,
  PiFingerprint,
  PiGear,
  PiSignOut,
  PiStar,
  PiUserCircleCheck,
} from 'react-icons/pi';
import {QueueListIcon} from '@heroicons/react/24/outline';
import {
  TbBell,
  TbBuilding,
  TbBuildingEstate,
  TbMapPinBolt, TbMessageCircle,
  TbRobotFace, TbTicket, TbUsers,
} from 'react-icons/tb';
import {BiCalendarAlt, BiHome} from "react-icons/bi";
import type {ItemType} from 'antd/es/menu/interface';
import Cookies from 'js-cookie';

import ScreenModeSelector from './ScreenModeSelector';
import logo from '../Assets/ga_logo.webp';
import logoDark from '../Assets/ga_logo_white.webp';
import AuthContext from '../Context/AuthContext';
import ErrorHandler from '../Utils/ErrorHandler';
import NavItem from './NavItem';
import './styles.less';

const menuItems: ItemType[] = [
  {
    label: 'Mi cuenta',
    icon: <PiUserCircleCheck size={18}/>,
    key: 'my-account',
  },
  {
    label: 'Favoritos',
    icon: <PiStar size={18}/>,
    key: 'favorites',
  },
  {
    label: 'Cerrar sesión',
    icon: <PiSignOut size={18}/>,
    key: 'logout',
    danger: true,
  },
];

const Navigation = () => {
  const {
    user,
    logout,
    config,
    setOpenMenu,
    openMenu,
    darkMode,
  } = useContext(AuthContext);
  const {pathname} = useLocation();
  const [api, contextHolder] = notification.useNotification();
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const [overlayChange, setOverlayChange] = useState<number>();

  useEffect(() => {
    setOpenMenu(false);
    setOverlayChange(Date.now);
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

  const setWorkspace = (event: any) => {
    axios
      .post('authentication/switch-workspace', {workspace: event.key})
      .then(response => {
        Cookies.set('workspace', event.key);
        Cookies.set('session_token', response.data.token);
        location.reload();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const handleUserMenuClick = (item: any) => {
    switch (item.key) {
      case 'logout':
        logout().then();
        break;
      case 'favorites':
        getFavorites();
        break;
    }
  };

  const tenantItems = user?.tenants?.map(t => ({
    label: t.config.name,
    icon: t.favicon ? <img alt="Icono" style={{width: 25}} src={t.favicon}/> : <TbBuilding size={25}/>,
    key: t.config.id,
  }));

  const oldSession = Cookies.get('old_session_token');
  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;
  return (<>
      <div className={`navigation-wrapper ${openMenu ? 'open' : ''}`}>
        {contextHolder}
        <div className={'container'}>
          <div className={'head'}>
            <Dropdown arrow={true} trigger={['click']} menu={{items: tenantItems, onClick: setWorkspace}}>
              <Tooltip title={config?.config?.name} placement={"right"}>
                <div className="logo-square">
                  <img src={tenantLogo || (darkMode ? logoDark : logo)} alt={config?.config?.name}/>
                  <PiCaretUpDown/>
                </div>
              </Tooltip>
            </Dropdown>
          </div>

          <nav className="navigation-items">
            <ul className="navigation-list">
              <NavItem label={'Dashboard'} icon={<BiHome/>} path={'/'}/>
              <NavItem icon={<TbUsers/>} label={'Pipeline'} path={'/crm/processes'}/>
              <NavItem icon={<TbBuildingEstate/>} label={'Propiedades'} path={'/warehouse/stock'}/>
              <NavItem icon={<BiCalendarAlt/>} label={'Agenda'} path={'/move/schedule'}/>
              <NavItem icon={<TbMessageCircle/>} label={'Mensajería'} path={'/crm/chat'}/>
              {config?.modules.includes('reservations') && (
                <NavItem icon={<PiCalendarCheckLight/>} label={'Reservas'} toggleStatus={overlayChange}>
                  <NavItem icon={<TbTicket/>} label={'Nueva reserva'} path={'/reservations/create'}/>
                  <NavItem icon={<QueueListIcon/>} label={'Reservas'} path={'/reservations/manager'}/>
                  {user?.roles?.includes('admin') && (
                    <>
                      <NavItem
                        icon={<TbBuildingEstate className={'icon'}/>}
                        label={'Espacios'}
                        path={'/reservations/vehicles'}
                      />
                      <NavItem icon={<TbMapPinBolt/>} label={'Servicios'} path={'/reservations/routes'}/>
                    </>
                  )}
                </NavItem>
              )}
              <NavItem label={'Configuración'} icon={<PiGear/>} toggleStatus={overlayChange}>
                <NavItem label={'Usuarios'} icon={<PiFingerprint/>} path={'/users'}/>
                <NavItem label={'Apariencia'} icon={<PiGear/>} path={'/config'}/>
                <NavItem label={'Propiedades'} icon={<PiGear/>} path={'/config'}/>
                <NavItem label={'General'} icon={<PiGear/>} path={'/config'}/>
              </NavItem>
            </ul>
          </nav>
          <Space>
            <Badge count={0}>
              <div className={'user-tool'} onClick={() => {
                api.success({message: 'Hola'});
                console.log('alert');
              }}>
                <TbBell size={20}/>
              </div>
            </Badge>
            {oldSession && <div className={'user-tool'} onClick={() => {
              if (oldSession) {
                Cookies.remove('old_session_token');
                Cookies.set('session_token', oldSession);
                location.reload();
              }
            }}>
              <TbRobotFace/>
            </div>}
            <ScreenModeSelector/>
            <Dropdown arrow={true} trigger={['click']} menu={{items: menuItems, onClick: handleUserMenuClick}}>
              <div className={'user-menu'}>
                <Avatar className={'avatar'} size={30} src={user?.profile?.avatar?.thumbnail}>
                  {user?.profile.name.substring(0, 1)}
                </Avatar>
              </div>
            </Dropdown>
          </Space>
        </div>
      </div>
      {openSubMenu && (<div className={'menu-overlay'} onClick={() => setOverlayChange(Date.now)}></div>)}
    </>
  );
};

export default Navigation;
