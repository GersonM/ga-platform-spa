import {type ReactNode, useContext} from 'react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {TbChevronLeft} from 'react-icons/tb';

import LoadingIndicator from '../LoadingIndicator';
import IconButton from '../IconButton';
import AuthContext from "../../Context/AuthContext.tsx";
import './styles.less';

interface ModuleSidebarProps {
  children?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  width?: number;
  title?: string;
  statusInfo?: string;
  loadingMessage?: string;
  loading?: boolean;
}

const ModuleSidebar = (
  {
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

  return (
    <>
      <div className={`module-sidebar-wrapper ${openMenu ? 'open' : ''}`} style={{width: width}}>
        <LoadingIndicator visible={loading} message={loadingMessage}/>
        <OverlayScrollbarsComponent className={'scroll-content'} defer options={{scrollbars: {autoHide: 'scroll'}}}>
          {(title || actions) && (
            <div className={'module-nav-header'}>
              <div className={'title'}>
                <h4>{title}</h4>
                {actions && <div className={'actions'}>{actions}</div>}
                <IconButton
                  onClick={() => setOpenMenu(!openMenu)}
                  icon={<TbChevronLeft/>}
                  small
                />
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
