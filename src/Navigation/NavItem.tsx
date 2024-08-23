import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {ChevronDownIcon} from '@heroicons/react/24/outline';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  children?: React.ReactNode[];
  path?: string;
}

const NavItem = ({path, label, icon, children}: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li>
      <div className={'item'}>
        {path ? (
          <NavLink to={path}>
            {icon}
            <span className={'label'}>{label}</span>
          </NavLink>
        ) : (
          <a href={'#'} onClick={() => setIsOpen(!isOpen)}>
            {icon}
            <span className={'label'}>{label}</span>
            {children && (
              <div className={`open-button ${isOpen ? 'open' : ''}`}>
                <ChevronDownIcon />
              </div>
            )}
          </a>
        )}
      </div>
      {children && <ul className={`${isOpen ? 'open' : ''}`}>{children}</ul>}
    </li>
  );
};

export default NavItem;
