import React from 'react';
import {NavLink} from 'react-router-dom';
import {EllipsisVerticalIcon} from '@heroicons/react/24/solid';

import {Container} from '../../../Types/api';
import ContainerDropdownActions from '../../Components/ContainerDropdownActions';
import IconButton from '../../../CommonUI/IconButton';

interface ContainerNavItemProps {
  container: Container;
  size?: number;
  onChange?: (container: Container) => void;
}

const ContainerNavItem = ({container, onChange}: ContainerNavItemProps) => {
  return (
    <>
      <NavLink to={`/file-management/${container.uuid}`}>
        <span className="icon icon-box"></span>
        <span className="label">
          {container.name}
          <small>
            {container.num_files} archivos | {container.num_containers} carpetas
          </small>
        </span>
      </NavLink>
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
  );
};

export default ContainerNavItem;
