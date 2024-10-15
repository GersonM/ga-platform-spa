import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {ChevronDownIcon} from '@heroicons/react/24/outline';
import {Badge} from 'antd';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  children?: React.ReactNode[];
  path?: string;
  notifications?: number;
}

const NavItem = ({path, label, icon, children, notifications}: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <>
      <span className={'label'}>{label}</span>
      <Badge showZero={false} count={notifications} />
    </>
  );

  return (
    <li>
      <div className={'item'}>
        {path ? (
          <NavLink to={path}>
            {icon}
            {content}
          </NavLink>
        ) : (
          <a href={'#'} onClick={() => setIsOpen(!isOpen)}>
            {icon}
            {content}
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
