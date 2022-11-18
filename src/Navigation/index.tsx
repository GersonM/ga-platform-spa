import React, {useContext, useEffect, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {Avatar, Dropdown, Menu} from 'antd';

import './styles.less';
import logo from '../Assets/logo_square.png';
import AuthContext from '../Context/AuthContext';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

const menuItems: ItemType[] = [
  {
    label: 'Mi cuenta',
    key: 'account',
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
          <img
            src={config?.favicon_white ? config.favicon_white : logo}
            alt="Logo"
          />
        </div>
        <Dropdown
          arrow={true}
          placement={'bottomRight'}
          trigger={['click']}
          overlay={<Menu onClick={logout} items={menuItems}></Menu>}>
          <div className="logged-user">
            <Avatar>{user?.name.substring(0, 1)}</Avatar>
          </div>
        </Dropdown>
      </div>
      <nav>
        <ul className="navigation-list">
          <li>
            <NavLink to={'/'}>
              <span className="icon icon-icons2"></span>
              <span className="label">Dasboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/file-management'}>
              <span className="icon icon-server"></span>
              <span className={'label'}>Gestor de Archivos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/commercial'}>
              <span className="icon icon-store"></span>
              <span className="label">Comercial</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/video'}>
              <span className="icon icon-clapboard-play"></span>
              <span className="label">Video</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
