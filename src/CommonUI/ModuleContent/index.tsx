import React, {useContext} from 'react';
import {Bars3Icon} from '@heroicons/react/24/solid';

import logo from '../../Assets/logo_square.png';
import AuthContext from '../../Context/AuthContext';
import IconButton from '../IconButton';

import './styles.less';

interface ModuleContentProps {
  children?: React.ReactNode;
  opaque?: boolean;
}

const ModuleContent = ({children, opaque}: ModuleContentProps) => {
  const {config, darkMode, openMenu, setOpenMenu} = useContext(AuthContext);
  const navLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <>
      <div className={'module-content-wrapper' + (opaque ? ' opaque' : '')}>
        <div className={'mobile-header'}>
          <div
            className="logo-square"
            onClick={() => {
              setOpenMenu(!openMenu);
            }}>
            <img src={navLogo || logo} alt="Logo" />
          </div>
          <IconButton icon={<Bars3Icon />} onClick={() => setOpenMenu(!openMenu)} />
        </div>
        {children}
      </div>
      {openMenu && (
        <div
          className={'module-nav-overlay'}
          onClick={() => {
            setOpenMenu(!openMenu);
          }}
        />
      )}
    </>
  );
};

export default ModuleContent;
