import React, {type ReactNode, useContext} from 'react';

import AuthContext from '../../Context/AuthContext';
import IconButton from '../IconButton';

import './styles.less';
import {TbMenu2} from "react-icons/tb";

interface ModuleContentProps {
  children?: ReactNode;
  opaque?: boolean;
  withSidebar?: boolean;
  style?: React.CSSProperties;
}

const ModuleContent = ({children, opaque, withSidebar = false, style}: ModuleContentProps) => {
  const {config, openMenu, setOpenMenu} = useContext(AuthContext);

  return (
    <>
      <div className={'mobile-header'}>
        <div
          className="logo-square"
          onClick={() => {
            setOpenMenu(!openMenu);
          }}>
          <img src={config?.dark_logo} alt="Logo" />
        </div>
        <IconButton icon={<TbMenu2 color={'#ffffff'} />} onClick={() => setOpenMenu(!openMenu)} />
      </div>
      <div className={`module-content-wrapper ${opaque ? ' opaque' : ''} ${withSidebar ? ' with-sidebar' : ''}`} style={style}>
        {children}
      </div>
    </>
  );
};

export default ModuleContent;
