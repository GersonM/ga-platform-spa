import React, {useState} from 'react';
import {Dropdown, MenuProps, Modal} from 'antd';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Container} from '../../../Types/api';
import RenameContainer from './RenameContainer';
import ShareContainer from './ShareContainer';
import {ArrowsRightLeftIcon, LockOpenIcon, ShareIcon, TrashIcon} from '@heroicons/react/16/solid';
import {LockClosedIcon, PencilIcon} from '@heroicons/react/24/solid';

interface ContainerDropdownActionsProps {
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  container: Container;
  onChange?: () => void;
}

const ContainerDropdownActions = ({children, trigger, container, onChange}: ContainerDropdownActionsProps) => {
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
      case 'share':
        setActiveAction('share');
        break;
      default:
        setActiveAction(option.key);
    }
  };

  const changeVisibility = () => {
    axios
      .post(`file-management/containers/${container.uuid}/change-visibility`, {is_public: !container.is_public})
      .then(response => {
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
      icon: container.is_public ? <LockClosedIcon width={16} /> : <LockOpenIcon width={16} />,
    },
    {label: 'Mover a otra ubicación', key: 'move', icon: <ArrowsRightLeftIcon width={16} />, disabled: true},
    {label: 'Cambiar nombre', key: 'rename', icon: <PencilIcon width={16} />, disabled: true},
    {label: 'Compartir', key: 'share', icon: <ShareIcon width={16} />},
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
