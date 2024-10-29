import React, {useContext, useState} from 'react';
import {Dropdown, MenuProps, Modal} from 'antd';
import axios from 'axios';
import {ShareIcon, StarIcon, LockClosedIcon, TrashIcon, LockOpenIcon} from '@heroicons/react/16/solid';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Container} from '../../../Types/api';
import RenameContainer from './RenameContainer';
import ShareContainer from './ShareContainer';
import AuthContext from '../../../Context/AuthContext';

interface ContainerDropdownActionsProps {
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  container: Container;
  onChange?: () => void;
}

const ContainerDropdownActions = ({children, trigger, container, onChange}: ContainerDropdownActionsProps) => {
  const {user} = useContext(AuthContext);
  const [activeAction, setActiveAction] = useState<string>();

  const onClick = (option: any) => {
    switch (option.key) {
      case 'delete':
        Modal.confirm({
          okText: 'Sí, borrar',
          content: '¿Seguro que quieres borrar este archivo?',
          onOk: () => deleteContainer(),
        });
        break;
      case 'change_visibility':
        changeVisibility();
        break;
      case 'favorite':
        addFavorite();
        break;
      default:
        setActiveAction(option.key);
    }
  };

  const addFavorite = () => {
    axios
      .post(`hr-management/profiles/${user?.profile.uuid}/favorites`, {uuid: container.uuid, entity: 'container'})
      .then(() => {
        if (onChange) {
          onChange();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const changeVisibility = () => {
    axios
      .post(`file-management/containers/${container.uuid}/change-visibility`, {is_public: !container.is_public})
      .then(() => {
        if (onChange) {
          onChange();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const deleteContainer = () => {
    axios
      .delete(`file-management/containers/${container.uuid}`, {})
      .then(() => {
        if (onChange) {
          onChange();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const items: MenuProps['items'] = [
    {
      label: container.is_public ? 'Hacer privado' : 'Convertir en público',
      key: 'change_visibility',
      icon: container.is_public ? <LockOpenIcon width={16} /> : <LockClosedIcon width={16} />,
    },
    {label: 'Mover a otra ubicación', key: 'move', icon: <span className={'icon icon-move'} />, disabled: true},
    {label: 'Cambiar nombre', key: 'rename', icon: <span className={'icon icon-pencil-line'} />},
    {label: 'Compartir', key: 'share', icon: <ShareIcon width={16} />},
    {label: 'Agregar como favorito', key: 'favorite', icon: <StarIcon width={16} />},
    {type: 'divider'},
    {label: 'Borrar', key: 'delete', danger: true, icon: <TrashIcon width={16} />},
  ];

  const getContent = () => {
    switch (activeAction) {
      case 'move':
      case 'rename':
        return <RenameContainer container={container} onCompleted={onComplete} />;
      case 'share':
        return <ShareContainer container={container} onCompleted={onComplete} />;
      default:
        return null;
    }
  };
  const onComplete = () => {
    setActiveAction(undefined);
    if (onChange) onChange();
  };

  return (
    <>
      <Dropdown menu={{items, onClick}} arrow trigger={trigger}>
        {children}
      </Dropdown>
      <Modal destroyOnClose={true} open={!!activeAction} footer={null} onCancel={() => setActiveAction(undefined)}>
        {getContent()}
      </Modal>
    </>
  );
};

export default ContainerDropdownActions;
