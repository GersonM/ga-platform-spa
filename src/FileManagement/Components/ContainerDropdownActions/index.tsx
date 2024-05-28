import React, { useState } from 'react';
import { Dropdown, MenuProps, Modal, List, Input, Button } from 'antd';
import RenameContainer from './RenameContainer';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import { Container } from '../../../Types/api';

interface ContainerDropdownActionsProps {
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  container: Container;
  onChange?: () => void;
}

const ContainerDropdownActions = ({ children, trigger, container, onChange }: ContainerDropdownActionsProps) => {
  const [activeAction, setActiveAction] = useState<string>();
  const [profiles, setProfiles] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  const onClick = (option: any) => {
    switch (option.key) {
      case 'delete':
        Modal.confirm({
          okText: 'Si, borrar',
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
            .post(`file-management/containers/${container.uuid}/change-visibility`, { is_public: !container.is_public })
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

  const fetchProfiles = () => {
    axios
            .post('/api/v1/share', { user_email: userEmail })
            .then(response => {
              setProfiles(response.data);
            })
            .catch(error => {
              ErrorHandler.showNotification(error);
            });
  };

  const items: MenuProps['items'] = [
    {
      label: container.is_public ? 'Hacer privado' : 'Convertir en público',
      key: 'change_visibility',
      icon: <span className={container.is_public ? 'icon icon-lock' : 'icon icon-earth'} />,
    },
    { label: 'Mover a otra ubicación', key: 'move', icon: <span className={'icon icon-move'} />, disabled: true },
    { label: 'Cambiar nombre', key: 'rename', icon: <span className={'icon icon-pencil-line'} />, disabled: true },
    {
      label: 'Compartir',
      key: 'share',
      icon: <span className={'icon icon-share'} />,
    },
    { type: 'divider' },
    { label: 'Borrar', key: 'delete', danger: true, icon: <span className={'icon icon-trash'} /> },
  ];

  const getContent = () => {
    switch (activeAction) {
      case 'move':
        return <RenameContainer container={container} onCompleted={onComplete} />;
      case 'rename':
        return <RenameContainer container={container} onCompleted={onComplete} />;
      case 'share':
        return (
                <>
                  <Input
                          placeholder="Ingrese correo electrónico"
                          value={userEmail}
                          onChange={e => setUserEmail(e.target.value)}
                          onPressEnter={fetchProfiles}
                  />
                  <Button onClick={fetchProfiles}>Buscar</Button>
                  <List
                          dataSource={profiles}
                          renderItem={profile => (
                                  <List.Item>
                                    <List.Item.Meta title={profile.name} description={profile.email} />
                                  </List.Item>
                          )}
                  />
                </>
        );
    }
  };

  const onComplete = () => {
    setActiveAction(undefined);
    if (onChange) onChange();
  };

  return (
          <>
            <Dropdown menu={{ items, onClick }} arrow trigger={trigger}>
              {children}
            </Dropdown>
            <Modal destroyOnClose={true} open={!!activeAction} footer={null} onCancel={() => setActiveAction(undefined)}>
              {getContent()}
            </Modal>
          </>
  );
};

export default ContainerDropdownActions;
