import {type ReactNode, useEffect, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {TbChevronDown} from "react-icons/tb";

interface NavItemProps {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  children?: ReactNode[];
  toggleStatus?: number;
  onOpen?: (isOpen: boolean) => void;
  path?: string;
  notifications?: number | string;
}

const NavItem = ({path, label, icon, children, notifications, onOpen, toggleStatus, disabled}: NavItemProps) => {
  const {pathname} = useLocation();
  const [isOpen, setIsOpen] = useState(pathname == path);

  useEffect(() => {
    setIsOpen(false);
  }, [toggleStatus]);

  useEffect(() => {
    if (onOpen) onOpen(isOpen);
  }, [isOpen]);


  const content = (
    <>
      <span className={'label'}>{label}</span>
      {(notifications != 0 && notifications != undefined) &&
        <div className={'notification-badge'}>{notifications}</div>}
    </>
  );

  return (
    <li>
      <div className={'item'}>
        {path ? (
          <NavLink to={path} style={disabled?{opacity:0.6, cursor:'not-allowed'}:{}}>
            {icon}
            {content}
          </NavLink>
        ) : (
          <a className={`${isOpen ? 'open' : ''}`} onClick={() => {
            setIsOpen(!isOpen);
          }}>
            {icon}
            {content}
            {children && (
              <div className={`open-button ${isOpen ? 'open' : ''}`}>
                <TbChevronDown/>
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
