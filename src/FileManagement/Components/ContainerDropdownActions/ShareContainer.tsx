import React, {useEffect, useState} from 'react';
import {Button, Divider, Dropdown, List, MenuProps, notification, Space, Tooltip} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import axios from 'axios';
import {PencilIcon, UserIcon, UserMinusIcon, UserPlusIcon, EyeIcon} from '@heroicons/react/24/solid';

import {Container, SharedProfile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import SearchProfile from '../../../CommonUI/SearchProfile';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import IconButton from '../../../CommonUI/IconButton';

interface ShareContainerProps {
  container: Container;
  onCompleted?: () => void;
}

const ShareContainer = ({container, onCompleted}: ShareContainerProps) => {
  const [sharedProfiles, setSharedProfiles] = useState<SharedProfile[]>([]);
  const [reload, setReload] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string | string[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    axios
      .get(`file-management/containers/${container.uuid}/authorizations`, config)
      .then(response => {
        setSharedProfiles(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
    return cancelTokenSource.cancel;
  }, [container.uuid, reload]);

  const shareProfile = () => {
    axios
      .post(`file-management/containers/${container.uuid}/authorizations`, {profile_uuid: selectedProfiles})
      .then(() => {
        notification.success({message: 'Acceso compartido'});
        onCompleted && onCompleted();
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const updateAuthorization = (uuid: string, level: string) => {
    axios
      .put(`file-management/containers/${container.uuid}/authorizations/${uuid}`, {level})
      .then(() => {
        notification.success({message: 'Acceso actualizado'});
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const handleDelete = (profileUUID: string, containerUUID: string) => {
    axios
      .delete(`file-management/containers/${containerUUID}/authorizations/${profileUUID}`)
      .then(() => {
        notification.success({message: 'Perfil eliminado'});
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const items: MenuProps['items'] = [
    {
      label: 'Ver',
      key: 'read',
      icon: <EyeIcon width={18} />,
    },
    {
      label: 'Editar',
      key: 'write',
      icon: <PencilIcon width={18} />,
    },
    {
      label: 'Propietario',
      key: 'owner',
      icon: <UserIcon width={18} />,
    },
  ];

  return (
    <div>
      <h2>Compartir acceso a "{container.name}"</h2>
      <p>Buscar a una persona por su nombre o correo para permitirle ver el contenido de esta carpeta.</p>
      <SearchProfile
        mode={'multiple'}
        style={{marginBottom: '10px'}}
        onChange={values => {
          setSelectedProfiles(values);
        }}
      />
      <PrimaryButton
        icon={<UserPlusIcon />}
        disabled={!selectedProfiles}
        label={'Compartir'}
        block
        onClick={shareProfile}
      />
      <Divider>Usuarios con acceso</Divider>
      <List
        dataSource={sharedProfiles}
        renderItem={(sp: SharedProfile) => (
          <List.Item
            actions={[
              <Dropdown
                menu={{
                  items,
                  onClick: menu => updateAuthorization(sp.uuid, menu.key),
                }}>
                <Button type={'text'}>
                  <Space>
                    {sp.level === 'read' ? 'Ver' : 'Editar'}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>,
              <Tooltip title={'Quitar usuario'}>
                <IconButton icon={<UserMinusIcon />} danger onClick={() => handleDelete(sp.uuid, sp.uuid)} />
              </Tooltip>,
            ]}>
            <List.Item.Meta title={sp.profile.name} description={sp.profile.email} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ShareContainer;
