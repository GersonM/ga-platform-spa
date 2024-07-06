import React, {useContext} from 'react';
import {useLocation} from 'react-router-dom';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import LoadingIndicator from '../LoadingIndicator';
import AuthContext from '../../Context/AuthContext';
import './styles.less';

interface ModuleSidebarProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  width?: number;
  title?: string;
  statusInfo?: string;
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
  statusInfo,
}: ModuleSidebarProps) => {
  const {openMenu, setOpenMenu} = useContext(AuthContext);
  const {pathname} = useLocation();

  return (
    <>
      <div className={`module-sidebar-wrapper ${openMenu ? 'open' : ''}`} style={{width: width}}>
        <LoadingIndicator visible={loading} message={loadingMessage} />
        <OverlayScrollbarsComponent className={'scroll-content'} defer options={{scrollbars: {autoHide: 'scroll'}}}>
          {(title || actions) && (
            <div className={'module-nav-header'}>
              <div className={'title'}>
                <h4>{title}</h4>
                {actions && <div className={'actions'}>{actions}</div>}
              </div>
              {header && <div className={'header'}>{header}</div>}
            </div>
          )}
          <div className={'module-nav-content'}>{children}</div>
        </OverlayScrollbarsComponent>
        {(footer || statusInfo) && (
          <div className={'module-nav-footer'}>
            {footer}
            {statusInfo && <div className={'status-info'}>{statusInfo}</div>}
          </div>
        )}
      </div>
    </>
  );
};

export default ModuleSidebar;
