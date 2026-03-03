import { useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Avatar, Badge, Dropdown, Popover, Space, Tag, Tooltip } from 'antd';
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
import { MapPinIcon, QueueListIcon } from '@heroicons/react/24/outline';
import {
  TbAdjustments,
  TbBook,
  TbBuilding,
  TbBuildingEstate,
  TbBuildingWarehouse, TbCalendar, TbContract,
  TbCurrencyDollar,
  TbForklift, TbGridDots, TbHeadset, TbHeartRateMonitor,
  TbListCheck, TbMapCheck, TbMapPinBolt, TbMask, TbMessageUser,
  TbPackage, TbPackageImport,
  TbPigMoney, TbShieldCheck, TbShieldOff, TbShoppingCartDown, TbShoppingCartUp, TbTicket, TbUser, TbUsersGroup,
} from 'react-icons/tb';
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { FaChalkboardTeacher } from 'react-icons/fa';
import type { ItemType } from 'antd/es/menu/interface';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { LuReceipt, LuReceiptText } from "react-icons/lu";
import Cookies from 'js-cookie';
import {sileo} from "sileo";

import ScreenModeSelector from './ScreenModeSelector';
import logo from '../Assets/ga_logo.webp';
import logoDark from '../Assets/ga_logo_white.webp';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import ErrorHandler from '../Utils/ErrorHandler';
import NavItem from './NavItem';
import {createNavigationTranslator} from '../i18n/navigation';
import './styles.less';

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
  const { pathname } = useLocation();
  const tenantId = config?.id;
  const t = useMemo(() => createNavigationTranslator(tenantId), [tenantId]);
  const menuItems: ItemType[] = useMemo(() => [
    {
      label: t('userMenu.myAccount'),
      icon: <PiUserCircleCheck size={18} />,
      key: 'my-account',
    },
    {
      label: t('userMenu.favorites'),
      icon: <PiStar size={18} />,
      key: 'favorites',
    },
    {
      label: t('userMenu.logout'),
      icon: <PiSignOut size={18} />,
      key: 'logout',
      danger: true,
    },
  ], [t]);

  console.log(tenantId);

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  const getFavorites = () => {
    axios
      .get(`hr-management/profiles/${user?.profile.uuid}/favorites`)
      .then(response => {
        sileo.info({title:response.data.length + ' favoritos'});
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const setWorkspace = (event: any) => {
    axios
      .post('authentication/switch-workspace', { workspace: event.key })
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
    icon: t.favicon ? <img alt="Icono" style={{ width: 25 }} src={t.favicon} /> : <TbBuilding size={25} />,
    key: t.config.id,
  }));

  const oldSession = Cookies.get('old_session_token');
  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;
  return (
    <div className={`navigation-wrapper ${openMenu ? 'open' : ''}`}>
      <div className={'head'}>
        <Dropdown arrow={true} trigger={['click']} menu={{ items: tenantItems, onClick: setWorkspace }}>
          <Tooltip title={config?.config?.name} placement={"right"}>
            <div className="logo-square">
              <img src={tenantLogo || (darkMode ? logoDark : logo)} alt={config?.config?.name} />
              <PiCaretUpDown />
            </div>
          </Tooltip>
        </Dropdown>
      </div>
      <OverlayScrollbarsComponent
        style={{ flex: 1 }} className={'scroll-content'} defer
        options={{ scrollbars: { autoHide: 'scroll' } }}>
        <nav>
          <ul className="navigation-list">
            <NavItem label={t('nav.dashboard')} icon={<TbGridDots />} path={'/'} />
            <NavItem
              label={t('nav.myTasks')}
              icon={<TbListCheck />}
              path={'/my-tasks'}
              notifications={activityCount?.pending}
            />
            {config?.modules.includes('files') && (
              <NavItem label={t('nav.fileManager')} icon={<PiHardDrives />} path={'/file-management'} />
            )}
            {config?.modules.includes('attendance') && (
              <NavItem label={t('nav.attendance')} icon={<PiClockUser />} code={'attendance'}>
                <NavItem label={t('nav.reports')} icon={<PiPresentationChart />} path={'/attendance/dashboard'} />
                <NavItem label={t('nav.attendance')} icon={<PiUsersThree />} path={'/attendance/management'} />
                <NavItem label={t('nav.accessControl')} icon={<PiUserFocus />} path={'/attendance/access-control'} />
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
              <NavItem label={t('nav.crm')} icon={<TbHeadset />} notifications={'Beta'} code={'crm'}>
                <NavItem icon={<PiUserFocus />} label={t('nav.crmLeadsAndCampaigns')} path={'/crm/leads'} />
                <NavItem icon={<TbMessageUser />} label={t('nav.messaging')} path={'/crm/chat'} />
                <NavItem icon={<TbContract />} label={t('nav.processes')} path={'/crm/processes'} />
                <NavItem icon={<TbAdjustments />} label={t('nav.configuration')} path={'/crm/configuration'} />
              </NavItem>
            )}
            {config?.modules.includes('commercial') && (
              <NavItem label={t('nav.commercial')} icon={<PiHandshake />} code={'commercial'}>
                <NavItem icon={<PiPresentationChart />} label={t('nav.dashboard')} path={'/commercial/dashboard'} />
                <NavItem icon={<PiWarningDiamond />} label={t('nav.incidents')} path={'/commercial/incidents'} />
                <NavItem icon={<PiUsers />} label={t('nav.clients')} path={'/commercial/clients'} />
                <NavItem icon={<TbShoppingCartUp />} label={t('nav.sales')} path={'/commercial/sales'} />
                <NavItem icon={<TbShoppingCartDown />} label={t('nav.purchases')} path={'/commercial/purchases'} />
                <NavItem icon={<TbContract />} label={t('nav.contractTemplates')} path={'/commercial/contract-templates'} />
                <NavItem icon={<TbUsersGroup />} label={t('nav.sellers')} path={'/commercial/sellers'} />
              </NavItem>
            )}
            <NavItem label={t('nav.inventory')} icon={<TbBuildingWarehouse />} code={'stock'}>
              <NavItem icon={<TbPackageImport />} label={t('nav.stock')} path={'/warehouse/stock'} />
              <NavItem icon={<TbMapCheck />} label={t('nav.map')} path={'/warehouse/locations'} />
              <NavItem icon={<TbPackage />} label={t('nav.catalog')} path={'/warehouse/products'} />
              <NavItem icon={<TbForklift />} label={t('nav.movements')} path={'/warehouse/activity'} />
            </NavItem>
            {config?.modules.includes('move') && (
              <NavItem icon={<PiCarProfile />} label={t('nav.move')} code={'move'}>
                <NavItem icon={<TbTicket />} label={t('nav.newReservation')} path={'/move/reservation'} />
                <NavItem icon={<QueueListIcon />} label={t('nav.myReservations')} path={'/move/trips'} />
                {user?.roles?.includes('admin') && (
                  <>
                    <NavItem
                      icon={<PiCarLight className={'icon'} />}
                      label={t('nav.vehiclesAndDrivers')}
                      path={'/move/vehicles'}
                    />
                    <NavItem icon={<MapPinIcon />} label={t('nav.routesAndPlaces')} path={'/move/routes'} />
                  </>
                )}
                <NavItem icon={<TbCalendar />} label={t('nav.calendar')} path={'/move/schedule'} />
              </NavItem>
            )}
            <NavItem label={t('nav.parada7')} icon={<PiCarProfile />} path={'/parada7/companies'} />
            {config?.modules.includes('reservations') && (
              <NavItem icon={<PiCalendarCheckLight />} label={t('nav.reservations')} code={'reservations'}>
                <NavItem icon={<TbTicket />} label={t('nav.newReservation')} path={'/reservations/create'} />
                <NavItem icon={<QueueListIcon />} label={t('nav.reservations')} path={'/reservations/manager'} />
                {user?.roles?.includes('admin') && (
                  <>
                    <NavItem
                      icon={<TbBuildingEstate className={'icon'} />}
                      label={t('nav.spaces')}
                      path={'/reservations/vehicles'}
                    />
                    <NavItem icon={<TbMapPinBolt />} label={t('nav.services')} path={'/reservations/routes'} />
                  </>
                )}
                <NavItem icon={<TbCalendar />} label={t('nav.calendar')} path={'/move/schedule'} />
              </NavItem>
            )}
            {config?.modules.includes('club') && (
              <NavItem label={t('nav.club')} icon={<PiUsers />} code={'club'}>
                <NavItem label={t('nav.members')} icon={<PiPerson />} path={'/club/subscriptions'} />
                <NavItem label={t('nav.importPayments')} icon={<PiMoney />} path={'/club/payments-import'} />
              </NavItem>
            )}
            {user?.roles?.includes('hr') && <NavItem label={t('nav.hr')} icon={<PiUsersThree />} path={'/hr'} />}
            {config?.modules.includes('payments') && (
              <NavItem label={t('nav.finance')} icon={<TbCurrencyDollar />} code={'payments'}>
                <NavItem label={t('nav.paymentRequests')} icon={<LuReceiptText />} path={'/finances/invoices'} />
                <NavItem label={t('nav.payments')} icon={<LuReceipt />} path={'/finances/payments'} />
                <NavItem label={t('nav.income')} icon={<GiReceiveMoney />} path={'/finances/transactions/deposit'} />
                <NavItem label={t('nav.expenses')} icon={<GiPayMoney />} path={'/finances/transactions/withdraw'} />
                <NavItem label={t('nav.accounts')} icon={<TbPigMoney />} path={'/finances/wallet-accounts'} />
              </NavItem>
            )}
            {config?.modules.includes('lms') && (
              <NavItem label={t('nav.lms')} icon={<PiGraduationCap />} code={'lms'}>
                <NavItem label={t('nav.courses')} icon={<PiBooksLight />} path={'/lms/courses'} />
                <NavItem label={t('nav.students')} icon={<PiStudent />} path={'/lms/students'} />
                <NavItem label={t('nav.teachers')} icon={<FaChalkboardTeacher />} path={'/lms/teachers'} />
              </NavItem>
            )}
            {config?.modules.includes('inbox') && (
              <NavItem label={t('nav.email')} icon={<PiMailboxDuotone />} path={'/inbox-management'} />
            )}
            {config?.modules.includes('resources') && (
              <NavItem label={t('nav.servicesAndResources')} icon={<TbHeartRateMonitor />} path={'/resources'} />
            )}
            <NavItem label={t('nav.contacts')} icon={<TbBook />} code={'contacts'}>
              <NavItem label={t('nav.people')} icon={<TbUser />} path={'/profiles'} />
              <NavItem label={t('nav.companies')} icon={<PiBuilding />} path={'/companies'} />
            </NavItem>
            {user?.roles?.includes('admin') && (
              <NavItem label={t('nav.administration')} icon={<TbBook />} code={'admin'}>
                <NavItem label={t('nav.users')} icon={<PiFingerprint />} path={'/users'} />
                <NavItem label={t('nav.configuration')} icon={<PiGear />} path={'/config'} />
              </NavItem>
            )}
          </ul>
        </nav>
      </OverlayScrollbarsComponent>
      <div className="bottom-nav">
        <Space>
          <div className={`user-tool ${secureMode ? '' : 'danger'}`} onClick={() => setSecureMode(!secureMode)}>
            <Popover
              title={<>{t('securityMode.title')} {secureMode ? <Tag color={'green'}>{t('securityMode.active')}</Tag> :
                <Tag color={'red'}>{t('securityMode.inactive')}</Tag>}</>}
              content={
                <>
                  {t('securityMode.description')} <br />{' '}
                </>
              }>
              {secureMode ? <TbShieldCheck /> : <TbShieldOff color={'red'} />}
            </Popover>
          </div>
          <Badge count={0}>
            <div className={'user-tool'} onClick={() => {
              sileo.info({title:'Hola'})
            }}>
              <TbMessageUser />
            </div>
          </Badge>
          {oldSession && <div className={'user-tool'} onClick={() => {
            if (oldSession) {
              Cookies.remove('old_session_token');
              Cookies.set('session_token', oldSession);
              location.reload();
            }
          }}>
            <TbMask />
          </div>}
          <ScreenModeSelector />
        </Space>
        <Dropdown arrow={true} trigger={['click']} menu={{ items: menuItems, onClick: handleUserMenuClick }}>
          <div className={'user-menu'}>
            <Avatar className={'avatar'} size={40} src={user?.profile?.avatar?.thumbnail}>
              {user?.profile.name.substring(0, 1)}
            </Avatar>
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
