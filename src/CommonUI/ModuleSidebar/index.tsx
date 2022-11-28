import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import './styles.less';

interface ModuleSidebarProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
}

const ModuleSidebar = ({title, children, actions, footer}: ModuleSidebarProps) => {
  const [open, setOpen] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={`module-sidebar-wrapper ${open ? 'open' : ''}`}>
      <a className={'toggle-button'} onClick={() => setOpen(!open)} href="#toggle">
        {open ? <span className="icon-chevron-left"></span> : <span className="icon-chevron-right"></span>}
      </a>
      <div className={'module-nav-header'}>
        <h4>{title}</h4>
        {actions && <div>{actions}</div>}
      </div>
      {children}
      {footer && <div className={'module-nav-footer'}>{footer}</div>}
    </div>
  );
};

export default ModuleSidebar;
