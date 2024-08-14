import React, {useContext, useEffect} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {Avatar, Dropdown, Popover, Progress} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import axios from 'axios';

import './styles.less';
import logo from '../Assets/logo_square.png';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';
import ErrorHandler from '../Utils/ErrorHandler';
import UploadInformation from '../FileManagement/Components/UploadInformation';

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
  const {user, logout, config, setDarkMode, darkMode, setOpenMenu, openMenu} = useContext(AuthContext);
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
          <li>
            <NavLink end to={'/'}>
              <span className="icon icon-icons2"></span>
              <span className="label">Dashboard</span>
            </NavLink>
          </li>
          {config?.modules.includes('files') && (
            <li>
              <NavLink to={'/file-management'}>
                <span className="icon icon-server"></span>
                <span className={'label'}>Gestor de Archivos</span>
              </NavLink>
            </li>
          )}
          {config?.modules.includes('inbox') && (
            <li>
              <NavLink to={'/inbox-management'}>
                <span className="icon icon-envelope-open"></span>
                <span className={'label'}>E-mail</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to={'/hr'}>
              <span className="icon icon-users2"></span>
              <span className={'label'}>RR. HH.</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/accounts'}>
              <span className="icon icon-shield"></span>
              <span className={'label'}>Seguridad</span>
            </NavLink>
          </li>
          {config?.modules.includes('lms') && (
            <li>
              <NavLink to={'/lms'}>
                <span className="icon icon-graduation-hat"></span>
                <span className={'label'}>LMS</span>
              </NavLink>
            </li>
          )}
          {config?.modules.includes('move') && (
            <li>
              <NavLink to={'/move'}>
                <span className="icon icon-bus2"></span>
                <span className={'label'}>Transporte</span>
              </NavLink>
            </li>
          )}
          {config?.modules.includes('attendance') && (
            <li>
              <NavLink to={'/attendance'}>
                <span className="icon icon-clock"></span>
                <span className={'label'}>Asistencia</span>
              </NavLink>
            </li>
          )}
          {config?.modules.includes('payments') && (
            <li>
              <NavLink to={'/invoices'}>
                <span className="icon icon-cash-dollar"></span>
                <span className={'label'}>Pagos</span>
              </NavLink>
            </li>
          )}
          {user?.roles?.includes('admin') && (
            <li>
              <NavLink to={'/config'}>
                <span className="icon icon-cog"></span>
                <span className={'label'}>Opciones</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="bottom-nav">
        <Popover
          placement={'right'}
          content={
            <>
              <h3>Cargas</h3>
              <UploadInformation />
            </>
          }>
          <Progress type={'circle'} size={43} percent={100} style={{marginBottom: '10px'}}>
            <UploadOutlined />
          </Progress>
        </Popover>
        <div className={'user-tool'} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <i className={'icon-sun'} /> : <i className={'icon-moon'} />}
        </div>
        <Dropdown
          arrow={true}
          placement={'topLeft'}
          trigger={['click']}
          menu={{items: menuItems, onClick: handleUserMenuClick}}>
          <Avatar size={'large'} className={'avatar'}>
            {user?.name.substring(0, 1)}
          </Avatar>
        </Dropdown>
      </div>
      <div className={'version-info'}>v{Package.version}</div>
    </div>
  );
};

export default Navigation;
