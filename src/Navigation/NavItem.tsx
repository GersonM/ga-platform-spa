import {type ReactNode, useState} from 'react';
import {NavLink} from 'react-router-dom';
import {Badge} from 'antd';
import {TbChevronDown} from "react-icons/tb";

interface NavItemProps {
  label: string;
  icon: ReactNode;
  children?: ReactNode[];
  path?: string;
  notifications?: number|string;
}

const NavItem = ({path, label, icon, children, notifications}: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <>
      <span className={'label'}>{label}</span>
      <Badge showZero={false} size={'small'} count={notifications} />
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
          <a href={'#'} className={`${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            {icon}
            {content}
            {children && (
              <div className={`open-button ${isOpen ? 'open' : ''}`}>
                <TbChevronDown />
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
