import React from 'react';
import {NavLink} from 'react-router-dom';
import {Button, Dropdown, Menu} from 'antd';
import {FiMoreVertical} from 'react-icons/fi';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

import './styles.less';

interface NavItemProps {
  name: string;
  caption?: string;
  path: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  menuItems?: ItemType[];
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
          {caption && <small>{caption}</small>}
        </span>
      </NavLink>
      {menuItems && (
        <Dropdown trigger={['click']} overlay={<Menu onClick={handleMenuClick} items={menuItems} />} arrow={true}>
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
