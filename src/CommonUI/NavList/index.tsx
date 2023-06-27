import React from 'react';
import {NavLink} from 'react-router-dom';
import {Button, Dropdown, MenuProps} from 'antd';
import {FiMoreVertical} from 'react-icons/fi';

import './styles.less';

interface NavItemProps {
  name: string;
  caption?: string;
  path: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  menuItems?: MenuProps;
}

const NavListItem = ({name, caption, icon, onClick, path, menuItems}: NavItemProps) => {
  const handleMenuClick = (element: any) => {
    switch (element.key) {
      case 'delete':
        break;
    }
  };

  return (
    <li className={'nav-list-item'}>
      <NavLink to={path} onClick={onClick}>
        {icon && <span className={'icon'}>{icon}</span>}
        <span className="label">
          {name}
          {caption && <span className={'caption'}>{caption}</span>}
        </span>
      </NavLink>
      {menuItems && (
        <Dropdown trigger={['click']} menu={menuItems} arrow={true}>
          <Button type={'link'} icon={<FiMoreVertical />} />
        </Dropdown>
      )}
    </li>
  );
};

interface NavListProps {
  children: React.ReactNode;
}

const NavList = ({children}: NavListProps) => {
  return <ul className={'nav-list'}>{children}</ul>;
};

export default NavList;
export {NavListItem};
