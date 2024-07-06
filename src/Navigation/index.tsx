import React, {useContext, useEffect} from 'react';
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
  const {user, logout, config, setDarkMode, darkMode, setOpenMenu, openMenu} = useContext(AuthContext);
  const {pathname} = useLocation();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

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
            <NavLink to={'/lms'}>
              <span className="icon icon-graduation-hat"></span>
              <span className={'label'}>LMS</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/store'}>
              <span className="icon icon-cart-full"></span>
              <span className={'label'}>Tienda</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/attendance'}>
              <span className="icon icon-clock"></span>
              <span className={'label'}>Asistencia</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/invoices'}>
              <span className="icon icon-cash-dollar"></span>
              <span className={'label'}>Pagos</span>
            </NavLink>
          </li>
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
        <div className={'user-tool'} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <i className={'icon-sun'} /> : <i className={'icon-moon'} />}
        </div>
        <Dropdown arrow={true} placement={'topLeft'} trigger={['click']} menu={{items: menuItems, onClick: logout}}>
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
