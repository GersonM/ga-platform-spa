import React from 'react';
import {NavLink} from 'react-router-dom';
import {EllipsisVerticalIcon} from '@heroicons/react/24/solid';
import {PiArchiveDuotone, PiTerminalWindowDuotone} from 'react-icons/pi';

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
        {container.is_locked ? <PiTerminalWindowDuotone className={'icon'} /> : <PiArchiveDuotone className={'icon'} />}
        <span className="label">
          {container.name}
          {!container.is_locked && (
            <small>
              {container.num_files} archivos | {container.num_containers} carpetas
            </small>
          )}
        </span>
      </NavLink>
      {!container.is_locked && (
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
