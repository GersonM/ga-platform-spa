import React from 'react';
import {NavLink} from 'react-router-dom';
import {Button, Dropdown, MenuProps} from 'antd';
import {FiMoreVertical} from 'react-icons/fi';
import axios from 'axios';

import {Container} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

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
  const handleMenuClick: MenuProps['onClick'] = (element: any) => {
    console.log(element.key);
    switch (element.key) {
      case 'delete':
        deleteContainer();
        break;
    }
  };

  const deleteContainer = () => {
    axios
      .delete(`file-management/containers/${container.uuid}`, {})
      .then(response => {
        if (onChange) {
          onChange(response.data);
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

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
      <Dropdown trigger={['click']} menu={{items, onClick: handleMenuClick}} arrow={true}>
        <Button type={'link'} icon={<FiMoreVertical />} />
      </Dropdown>
    </>
  );
};

export default ContainerNavItem;
