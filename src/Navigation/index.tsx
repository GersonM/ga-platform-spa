import React, {useContext, useEffect, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {Avatar, Dropdown} from 'antd';

import './styles.less';
import logo from '../Assets/logo_square.png';
import AuthContext from '../Context/AuthContext';
import Package from '../../package.json';

const menuItems: ItemType[] = [
  {
    label: 'Mi cuenta',
    key: 'account',
    disabled: true,
  },
  {
    label: 'Cerrar sesión',
    key: 'logout',
  },
];

const Navigation = () => {
  const {user, logout, config} = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={`navigation-wrapper ${open ? 'open' : ''}`}>
      <div className={'head'}>
        <div
          className="logo-square"
          onClick={() => {
            setOpen(!open);
          }}>
          <img src={config?.favicon_white ? config.favicon_white : logo} alt="Logo" />
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
          <li>
            <NavLink to={'/file-management'}>
              <span className="icon icon-server"></span>
              <span className={'label'}>Gestor de Archivos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/inbox-management'}>
              <span className="icon icon-envelope-open"></span>
              <span className={'label'}>E-mail</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/accounts'}>
              <span className="icon icon-users2"></span>
              <span className={'label'}>Usuarios</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/config'}>
              <span className="icon icon-cog"></span>
              <span className={'label'}>Opciones</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <Dropdown arrow={true} placement={'topLeft'} trigger={['click']} menu={{items: menuItems, onClick: logout}}>
        <div className="logged-user">
          <Avatar size={'large'} className={'avatar'}>
            {user?.name.substring(0, 1)}
          </Avatar>
        </div>
      </Dropdown>
      <div className={'version-info'}>v{Package.version}</div>
    </div>
  );
};

export default Navigation;
