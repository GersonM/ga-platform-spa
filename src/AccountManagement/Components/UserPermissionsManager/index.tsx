import React, {useEffect, useState} from 'react';
import {Button, Divider, Empty, List, Space} from 'antd';
import {TrashIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import {Role, User} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import IconButton from '../../../CommonUI/IconButton';
import {PiPlus} from 'react-icons/pi';

interface UserPermissionsManagerProps {
  user: User;
  onChange?: () => void;
}

const UserPermissionsManager = ({user, onChange}: UserPermissionsManagerProps) => {
  const [roles, setRoles] = useState<Role[]>();
  const [addingRole, setAddingRole] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`authentication/roles`, config)
      .then(response => {
        if (response) {
          setRoles(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  const assignRole = (roleID: number) => {
    setAddingRole(true);
    axios
      .post(`authentication/users/${user.uuid}/add-role`, {role_id: roleID})
      .then(() => {
        setAddingRole(false);
        onChange && onChange();
      })
      .catch(error => {
        setAddingRole(false);
        ErrorHandler.showNotification(error);
      });
  };

  const removeRole = (roleID: number) => {
    setAddingRole(true);
    axios
      .post(`authentication/users/${user.uuid}/remove-role`, {role_id: roleID})
      .then(() => {
        setAddingRole(false);
        onChange && onChange();
      })
      .catch(error => {
        setAddingRole(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <LoadingIndicator visible={addingRole} />
      <h3>Roles asignados</h3>
      <List bordered size={'small'}>
        {user.roles?.map((role, index) => (
          <List.Item
            key={index}
            title={role.name}
            actions={[<IconButton small danger icon={<TrashIcon />} onClick={() => removeRole(role.id)} />]}>
            {role.name}
          </List.Item>
        ))}
      </List>
      {user.roles && user.roles.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay roles asignados'} />
      )}
      <br />
      <br />
      <h3>Asignar un rol nuevo</h3>
      <List bordered size={'small'}>
        {roles?.map(r => {
          return (
            <List.Item
              key={r.id}
              actions={[
                <Button icon={<PiPlus />} size={'small'} type={'link'} onClick={() => assignRole(r.id)}>
                  Asignar
                </Button>,
              ]}>
              <List.Item.Meta title={r.name} description={r.permissions.map(p => p.name.split('.')[1]).join(', ')} />
            </List.Item>
          );
        })}
      </List>
    </>
  );
};

export default UserPermissionsManager;
