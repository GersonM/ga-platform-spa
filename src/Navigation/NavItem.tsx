import React from 'react';
import {SmoothCorners} from 'react-smooth-corners';
import {NavLink} from 'react-router-dom';

interface NavItemProps {
  label: string;
  icon: string;
  path: string;
}

const NavItem = ({path, label, icon}: NavItemProps) => {
  return (
    <li>
      <NavLink to={path}>
        <SmoothCorners className={'nav-item-content'} borderRadius="12px" corners="10, 43">
          <span className={icon}></span>
          <span className={'label'}>{label}</span>
        </SmoothCorners>
      </NavLink>
    </li>
  );
};

export default NavItem;
