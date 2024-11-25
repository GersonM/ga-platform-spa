import React from 'react';
import {NavLink} from 'react-router-dom';
import {Dropdown, MenuProps} from 'antd';
import {EllipsisVerticalIcon} from '@heroicons/react/24/solid';

import './styles.less';
import IconButton from '../IconButton';

interface NavItemProps {
  name: string | React.ReactNode;
  caption?: string;
  path: string;
  image: string;
  icon?: React.ReactNode;
  height?: number;
  onClick?: () => void;
  menuItems?: MenuProps;
}

const NavListItem = ({image, name, caption, icon, onClick, path, menuItems, height}: NavItemProps) => {
  return (
    <li className={'nav-list-item'}>
      <NavLink to={path} onClick={onClick} style={{height}}>
        {image ? <img className={'avatar'} src={image} alt="Imae" /> : icon && <span className={'icon'}>{icon}</span>}
        <span className="label">
          {name}
          {caption && <span className={'caption'}>{caption}</span>}
        </span>
      </NavLink>
      {menuItems && (
        <Dropdown trigger={['click']} menu={menuItems} arrow={true}>
          <IconButton icon={<EllipsisVerticalIcon />} />
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
