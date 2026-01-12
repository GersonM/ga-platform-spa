import {useContext, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {Avatar, Badge, Dropdown, notification, Popover, Space, Tag, Tooltip} from 'antd';
import axios from 'axios';
import {
  PiBooksLight,
  PiBuilding,
  PiCalendarCheckLight,
  PiCaretUpDown,
  PiCarLight,
  PiCarProfile,
  PiClockUser,
  PiDotsThreeVerticalBold,
  PiFingerprint,
  PiGear,
  PiGraduationCap,
  PiHandshake,
  PiHardDrives,
  PiMailboxDuotone,
  PiMoney,
  PiPerson,
  PiPresentationChart,
  PiSignOut,
  PiStar,
  PiStudent,
  PiUserCircleCheck,
  PiUserFocus,
  PiUsers,
  PiUsersThree,
  PiWarningDiamond,
} from 'react-icons/pi';
import {MapPinIcon, QueueListIcon} from '@heroicons/react/24/outline';
import {
  TbAdjustments,
  TbBook,
  TbBuilding,
  TbBuildingEstate,
  TbBuildingWarehouse, TbCalendar, TbContract,
  TbCurrencyDollar,
  TbForklift, TbGridDots, TbHeadset, TbHeartRateMonitor, TbInvoice,
  TbListCheck, TbMapPinBolt, TbMessageUser,
  TbPackage, TbPackageImport,
  TbPigMoney,
  TbRobotFace, TbShieldCheck, TbShieldOff, TbShoppingCartDown, TbShoppingCartUp, TbTicket, TbUser, TbUsersGroup,
} from 'react-icons/tb';
import {GiPayMoney, GiReceiveMoney} from "react-icons/gi";
import {FaChalkboardTeacher} from 'react-icons/fa';
import type {ItemType} from 'antd/es/menu/interface';
import {OverlayScrollbarsComponent} from "overlayscrollbars-react";
import Cookies from 'js-cookie';

import ScreenModeSelector from './ScreenModeSelector';
import logo from '../Assets/ga_logo_white.webp';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import ErrorHandler from '../Utils/ErrorHandler';
import NavItem from './NavItem';
import './styles.less';
import {LuReceipt, LuReceiptText} from "react-icons/lu";

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
    setSecureMode,
    secureMode,
    user,
    logout,
    config,
    setOpenMenu,
    openMenu,
    darkMode,
    activityCount
  } = useContext(AuthContext);
  const {pathname} = useLocation();
  const [api, contextHolder] = notification.useNotification();

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
  return (
    <div className={`navigation-wrapper ${openMenu ? 'open' : ''}`}>
      {contextHolder}
      <div className={'head'}>
        <Dropdown arrow={true} trigger={['click']} menu={{items: tenantItems, onClick: setWorkspace}}>
          <Tooltip title={config?.config?.name} placement={"right"}>
            <div className="logo-square">
              <img src={tenantLogo || logo} alt={config?.config?.name}/>
              <PiCaretUpDown/>
            </div>
          </Tooltip>
        </Dropdown>
      </div>
      <OverlayScrollbarsComponent
        style={{flex: 1}} className={'scroll-content'} defer
        options={{scrollbars: {autoHide: 'scroll'}}}>
        <nav>
          <ul className="navigation-list">
            <NavItem label={'Dashboard'} icon={<TbGridDots/>} path={'/'}/>
            <NavItem
              label={'Mis tareas'}
              icon={<TbListCheck/>}
              path={'/my-tasks'}
              notifications={activityCount?.pending}
            />
            {config?.modules.includes('files') && (
              <NavItem label={'Gestor de Archivos'} icon={<PiHardDrives/>} path={'/file-management'}/>
            )}
            {config?.modules.includes('attendance') && (
              <NavItem label={'Asistencia'} icon={<PiClockUser/>} code={'attendance'}>
                <NavItem label={'Reportes'} icon={<PiPresentationChart/>} path={'/attendance/dashboard'}/>
                <NavItem label={'Asistencia'} icon={<PiUsersThree/>} path={'/attendance/management'}/>
                <NavItem label={'Control de acceso'} icon={<PiUserFocus/>} path={'/attendance/access-control'}/>
              </NavItem>
            )}
            {/*config?.modules.includes('real-estate') && (
              <NavItem label={'Constructora'} icon={<PiBulldozerLight/>}>
                <NavItem icon={<PiPresentationChart/>} label={'Dashboard'} path={'/real-estate/dashboard'}/>
                <NavItem icon={<PiBuildingsLight/>} label={'Propiedades'} path={'/real-estate/estates'}/>
                <NavItem icon={<PiVectorThreeLight/>} label={'Proyectos'} path={'/real-estate/projects'}/>
                <NavItem icon={<PiDoorOpenLight/>} label={'Entregas'} path={'/real-estate/providing'}/>
              </NavItem>
            )*/}
            {config?.modules.includes('crm') && (
              <NavItem label={'CRM'} icon={<TbHeadset/>} notifications={'Beta'} code={'crm'}>
                <NavItem icon={<PiUserFocus/>} label={'Leads & campañas'} path={'/crm/leads'}/>
                <NavItem icon={<TbMessageUser/>} label={'Mensajería'} path={'/crm/chat'}/>
                <NavItem icon={<TbContract/>} label={'Procesos'} path={'/crm/processes'}/>
                <NavItem icon={<TbAdjustments/>} label={'Configuración'} path={'/crm/configuration'}/>
              </NavItem>
            )}
            {config?.modules.includes('commercial') && (
              <NavItem label={'Comercial'} icon={<PiHandshake/>} code={'commercial'}>
                <NavItem icon={<PiPresentationChart/>} label={'Dashboard'} path={'/commercial/dashboard'}/>
                <NavItem icon={<PiWarningDiamond/>} label={'Incidencias'} path={'/commercial/incidents'}/>
                <NavItem icon={<PiUsers/>} label={'Clientes'} path={'/commercial/clients'}/>
                <NavItem icon={<TbShoppingCartUp/>} label={'Ventas'} path={'/commercial/sales'}/>
                <NavItem icon={<TbShoppingCartDown/>} label={'Compras'} path={'/commercial/purchases'}/>
                <NavItem icon={<TbContract/>} label={'Plantillas de contrato'} path={'/commercial/contract-templates'}/>
                <NavItem icon={<TbUsersGroup/>} label={'Vendedores'} path={'/commercial/sellers'}/>
              </NavItem>
            )}
            <NavItem label={'Inventario'} icon={<TbBuildingWarehouse/>} code={'stock'}>
              <NavItem icon={<TbPackageImport/>} label={'Stock'} path={'/warehouse/stock'}/>
              <NavItem icon={<TbPackage/>} label={'Productos'} path={'/warehouse/products'}/>
              <NavItem icon={<TbForklift/>} label={'Movimientos'} path={'/warehouse/activity'}/>
            </NavItem>
            {config?.modules.includes('move') && (
              <NavItem icon={<PiCarProfile/>} label={'Transporte'} code={'move'}>
                <NavItem icon={<TbTicket/>} label={'Nueva reserva'} path={'/move/reservation'}/>
                <NavItem icon={<QueueListIcon/>} label={'Mis reservas'} path={'/move/trips'}/>
                {user?.roles?.includes('admin') && (
                  <>
                    <NavItem
                      icon={<PiCarLight className={'icon'}/>}
                      label={'Vehículos & conductores'}
                      path={'/move/vehicles'}
                    />
                    <NavItem icon={<MapPinIcon/>} label={'Rutas & lugares'} path={'/move/routes'}/>
                  </>
                )}
                <NavItem icon={<TbCalendar/>} label={'Calendario'} path={'/move/schedule'}/>
              </NavItem>
            )}
            {config?.modules.includes('reservations') && (
              <NavItem icon={<PiCalendarCheckLight/>} label={'Reservas'} code={'reservations'}>
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
                <NavItem icon={<TbCalendar/>} label={'Calendario'} path={'/move/schedule'}/>
              </NavItem>
            )}
            {config?.modules.includes('club') && (
              <NavItem label={'Club'} icon={<PiUsers/>} code={'club'}>
                <NavItem label={'Socios'} icon={<PiPerson/>} path={'/club/subscriptions'}/>
                <NavItem label={'Importar pagos'} icon={<PiMoney/>} path={'/club/payments-import'}/>
              </NavItem>
            )}
            {user?.roles?.includes('hr') && <NavItem label={'RR. HH.'} icon={<PiUsersThree/>} path={'/hr'}/>}
            {config?.modules.includes('payments') && (
              <NavItem label={'Finanzas'} icon={<TbCurrencyDollar/>} code={'payments'}>
                <NavItem label={'Req. de pago'} icon={<LuReceiptText/>} path={'/finances/invoices'}/>
                <NavItem label={'Pagos'} icon={<LuReceipt/>} path={'/finances/payments'}/>
                <NavItem label={'Ingresos'} icon={<GiReceiveMoney/>} path={'/finances/transactions/deposit'}/>
                <NavItem label={'Salidas'} icon={<GiPayMoney/>} path={'/finances/transactions/withdraw'}/>
                <NavItem label={'Cuentas'} icon={<TbPigMoney/>} path={'/finances/wallet-accounts'}/>
              </NavItem>
            )}
            {config?.modules.includes('lms') && (
              <NavItem label={'LMS'} icon={<PiGraduationCap/>} code={'lms'}>
                <NavItem label={'Cursos'} icon={<PiBooksLight/>} path={'/lms/courses'}/>
                <NavItem label={'Estudiantes'} icon={<PiStudent/>} path={'/lms/students'}/>
                <NavItem label={'Profesores'} icon={<FaChalkboardTeacher/>} path={'/lms/teachers'}/>
              </NavItem>
            )}
            {config?.modules.includes('inbox') && (
              <NavItem label={'E-mail'} icon={<PiMailboxDuotone/>} path={'/inbox-management'}/>
            )}
            {config?.modules.includes('resources') && (
              <NavItem label={'Servicios y recursos'} icon={<TbHeartRateMonitor/>} path={'/resources'}/>
            )}
            <NavItem label={'Contactos'} icon={<TbBook/>} code={'contacts'}>
              <NavItem label={'Personas'} icon={<TbUser/>} path={'/profiles'}/>
              <NavItem label={'Empresas'} icon={<PiBuilding/>} path={'/companies'}/>
            </NavItem>
            {user?.roles?.includes('admin') && (
              <>
                <NavItem label={'Usuarios'} icon={<PiFingerprint/>} path={'/users'}/>
                <NavItem label={'Administración'} icon={<PiGear/>} path={'/config'}/>
              </>
            )}
          </ul>
        </nav>
      </OverlayScrollbarsComponent>
      <div className="bottom-nav">
        <Space>
          <div className={`user-tool ${secureMode ? '' : 'danger'}`} onClick={() => setSecureMode(!secureMode)}>
            <Popover
              title={<>Modo seguro {secureMode ? <Tag color={'green'}>Activo</Tag> :
                <Tag color={'red'}>Desactivado</Tag>}</>}
              content={
                <>
                  Muestra u oculta información que podría ser sensible <br/>{' '}
                </>
              }>
              {secureMode ? <TbShieldCheck/> : <TbShieldOff color={'red'}/>}
            </Popover>
          </div>
          <Badge count={0}>
            <div className={'user-tool'} onClick={() => {
              api.success({message: 'Hola'});
              console.log('alert');
            }}>
              <TbMessageUser/>
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
        </Space>
        <Dropdown arrow={true} trigger={['click']} menu={{items: menuItems, onClick: handleUserMenuClick}}>
          <div className={'user-menu'}>
            <Avatar className={'avatar'} size={40} src={user?.profile?.avatar?.thumbnail}>
              {user?.profile.name.substring(0, 1)}
            </Avatar>
            <div>
              {user?.profile.name}
              <small>{user?.profile.email}</small>
            </div>
            <PiDotsThreeVerticalBold size={20}/>
          </div>
        </Dropdown>
      </div>
      <div className={'version-info'}>v{Package.version}</div>
    </div>
  );
};

export default Navigation;
