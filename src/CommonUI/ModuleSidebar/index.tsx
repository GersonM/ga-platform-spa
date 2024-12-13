import React, {useContext, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import LoadingIndicator from '../LoadingIndicator';
import AuthContext from '../../Context/AuthContext';
import './styles.less';
import IconButton from '../IconButton';
import {BiLeftArrow} from 'react-icons/bi';
import {ChevronDoubleRightIcon, ChevronLeftIcon} from '@heroicons/react/16/solid';
import {Tooltip} from 'antd';

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
  const [openMenu, setOpenMenu] = useState(true);
  const {pathname} = useLocation();

  return (
    <>
      <div className={`module-sidebar-wrapper ${openMenu ? 'open' : ''}`} style={{width: width}}>
        {!openMenu && (
          <span className={'open-menu'} onClick={() => setOpenMenu(!openMenu)}>
            <ChevronDoubleRightIcon height={20} />
          </span>
        )}
        {openMenu && (
          <>
            <LoadingIndicator visible={loading} message={loadingMessage} />
            <OverlayScrollbarsComponent className={'scroll-content'} defer options={{scrollbars: {autoHide: 'scroll'}}}>
              {(title || actions) && (
                <div className={'module-nav-header'}>
                  <div className={'title'}>
                    <h4>{title}</h4>
                    {actions && <div className={'actions'}>{actions}</div>}
                    <Tooltip title={'Ocultar menu'}>
                      <IconButton
                        onClick={() => setOpenMenu(!openMenu)}
                        icon={<ChevronLeftIcon fontSize={18} />}
                        small
                      />
                    </Tooltip>
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
          </>
        )}
      </div>
    </>
  );
};

export default ModuleSidebar;
