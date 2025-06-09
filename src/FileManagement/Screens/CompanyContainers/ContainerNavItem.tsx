import React, {useContext} from 'react';
import {NavLink} from 'react-router-dom';
import {EllipsisVerticalIcon} from '@heroicons/react/24/solid';
import {FiHardDrive, FiTerminal} from 'react-icons/fi';

import {Container} from '../../../Types/api';
import ContainerDropdownActions from '../../Components/ContainerDropdownActions';
import IconButton from '../../../CommonUI/IconButton';
import AuthContext from '../../../Context/AuthContext';

interface ContainerNavItemProps {
  container: Container;
  size?: number;
  onChange?: (container: Container) => void;
}

const ContainerNavItem = ({container, onChange}: ContainerNavItemProps) => {
  const {user} = useContext(AuthContext);
  return (
    <>
      <NavLink to={`/file-management/${container.uuid}`}>
        {container.is_locked ? <FiTerminal className={'icon'} /> : <FiHardDrive className={'icon'} />}
        <span className="label">
          {container.name}
          {!container.is_locked && (
            <small>
              {container.num_files} archivos | {container.num_containers} carpetas
            </small>
          )}
        </span>
      </NavLink>
      {(!container.is_locked || user?.roles?.includes('admin')) && (
        <>
          <span className={`icon ${container.is_public ? 'icon-earth' : 'icon-lock'}`} />
          <ContainerDropdownActions
            container={container}
            trigger={['click']}
            onChange={() => {
              if (onChange) {
                onChange(container);
              }
            }}>
            <IconButton icon={<EllipsisVerticalIcon />} />
          </ContainerDropdownActions>
        </>
      )}
    </>
  );
};

export default ContainerNavItem;
