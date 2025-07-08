import {type ReactNode, useContext} from 'react';

import logoDark from '../../Assets/ga_logo_white.webp';
import logo from '../../Assets/ga_logo.webp';
import AuthContext from '../../Context/AuthContext';
import IconButton from '../IconButton';

import './styles.less';
import {TbMenu2} from "react-icons/tb";

interface ModuleContentProps {
  children?: ReactNode;
  opaque?: boolean;
  withSidebar?: boolean;
}

const ModuleContent = ({children, opaque, withSidebar = false}: ModuleContentProps) => {
  const {config, darkMode, openMenu, setOpenMenu} = useContext(AuthContext);
  const navLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <>
      <div className={'mobile-header'}>
        <div
          className="logo-square"
          onClick={() => {
            setOpenMenu(!openMenu);
          }}>
          <img src={navLogo || (darkMode ? logoDark : logo)} alt="Logo" />
        </div>
        <IconButton icon={<TbMenu2 />} onClick={() => setOpenMenu(!openMenu)} />
      </div>
      <div className={`module-content-wrapper ${opaque ? ' opaque' : ''} ${withSidebar ? ' with-sidebar' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default ModuleContent;
