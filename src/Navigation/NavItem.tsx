import {type ReactNode, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {TbChevronDown} from "react-icons/tb";

interface NavItemProps {
  label: string;
  icon: ReactNode;
  children?: ReactNode[];
  path?: string;
  notifications?: number|string;
}
const NavItem = ({path, label, icon, children, notifications}: NavItemProps) => {
  const {pathname} = useLocation();
  const [isOpen, setIsOpen] = useState(pathname==path);


  const content = (
    <>
      <span className={'label'}>{label}</span>
      {(notifications != 0 && notifications != undefined) && <div className={'notification-badge'}>{notifications}</div>}
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
          <span className={`${isOpen ? 'open' : ''} divider`} onClick={() => setIsOpen(!isOpen)}>
            {content}
            <span className="line"></span>
            {children && (
              <div className={`open-button ${isOpen ? 'open' : ''}`}>
                <TbChevronDown />
              </div>
            )}
          </span>
        )}
      </div>
      {children && <ul className={`${isOpen ? 'open' : ''}`}>{children}</ul>}
    </li>
  );
};

export default NavItem;
