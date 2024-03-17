import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import './styles.less';
import LoadingIndicator from '../LoadingIndicator';

interface ModuleSidebarProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  width?: number;
  title?: string;
  loadingMessage?: string;
  loading?: boolean;
}

const ModuleSidebar = ({
  title,
  children,
  actions,
  header,
  footer,
  width,
  loading,
  loadingMessage,
}: ModuleSidebarProps) => {
  const [open, setOpen] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <a className={`toggle-button ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} href="#toggle">
        {open ? <span className="icon-chevron-left"></span> : <span className="icon-chevron-right"></span>}
      </a>
      <div className={`module-sidebar-wrapper ${open ? 'open' : ''}`} style={{width: width}}>
        <LoadingIndicator visible={loading} message={loadingMessage} />
        <OverlayScrollbarsComponent className={'scroll-content'} defer options={{scrollbars: {autoHide: 'scroll'}}}>
          {(title || actions) && (
            <div className={'module-nav-header'}>
              <div className={'title'}>
                <h4>{title}</h4>
                {actions && <div>{actions}</div>}
              </div>
              {header && <div>{header}</div>}
            </div>
          )}
          <div className={'module-nav-content'}>{children}</div>
        </OverlayScrollbarsComponent>
        {footer && <div className={'module-nav-footer'}>{footer}</div>}
      </div>
    </>
  );
};

export default ModuleSidebar;
