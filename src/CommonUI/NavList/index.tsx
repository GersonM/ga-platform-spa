import type {ReactNode} from "react";
import {NavLink} from 'react-router-dom';
import {Dropdown} from 'antd';
import type {MenuProps} from 'antd';
import {EllipsisVerticalIcon} from '@heroicons/react/24/solid';

import IconButton from '../IconButton';
import './styles.less';

interface NavItemProps {
  name: string | ReactNode;
  caption?: string;
  path: string;
  image?: string;
  icon?: ReactNode;
  height?: number;
  onClick?: () => void;
  menuItems?: MenuProps;
}

const NavListItem = ({image, name, caption, icon, onClick, path, menuItems, height}: NavItemProps) => {
  return (
    <li className={'nav-list-item'}>
      <NavLink to={path} onClick={onClick} style={{height}}>
        {image ? <img className={'avatar'} src={image} alt="Imae" /> : icon && <span className={'icon'}>{icon}</span>}
        <div className="label">
          {name}
          {caption && <span className={'caption'}>{caption}</span>}
        </div>
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
  children: ReactNode;
}

const NavList = ({children}: NavListProps) => {
  return <ul className={'nav-list'}>{children}</ul>;
};

export default NavList;
export {NavListItem};
