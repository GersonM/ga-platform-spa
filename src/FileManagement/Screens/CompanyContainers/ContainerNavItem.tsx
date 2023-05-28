import React from 'react';
import {NavLink} from 'react-router-dom';
import {Button, Dropdown, MenuProps} from 'antd';
import {FiMoreVertical} from 'react-icons/fi';
import axios from 'axios';

import {Container} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ContainerDropdownActions from '../../Components/ContainerDropdownActions';

interface ContainerNavItemProps {
  container: Container;
  size?: number;
  onChange?: (container: Container) => void;
}

const items: MenuProps['items'] = [
  {
    label: 'Mover a otro contenedor',
    key: 'move',
    disabled: true,
  },
  {
    label: 'Renombrar',
    key: 'rename',
    disabled: true,
  },
  {
    type: 'divider',
  },
  {
    label: 'Borrar',
    key: 'delete',
  },
];

const ContainerNavItem = ({container, onChange}: ContainerNavItemProps) => {
  return (
    <>
      <NavLink to={`/file-management/containers/${container.uuid}`}>
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
        <Button type={'link'} icon={<FiMoreVertical />} />
      </ContainerDropdownActions>
    </>
  );
};

export default ContainerNavItem;
