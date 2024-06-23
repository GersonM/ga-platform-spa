import React, {useEffect, useState} from 'react';
import {Button, Divider, Empty, Space} from 'antd';
import {TrashIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import {Role, User} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import IconButton from '../../../CommonUI/IconButton';

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
      {user.roles?.map((role, index) => (
        <div key={index}>
          <Space>
            {role.name}
            <IconButton danger icon={<TrashIcon />} onClick={() => removeRole(role.id)} />
          </Space>
        </div>
      ))}
      {user.roles && user.roles.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay roles asignados'} />
      )}
      <Divider />
      <h3>Agregar otro rol</h3>
      {roles?.map(r => {
        return (
          <div key={r.id}>
            <Space>
              {r.name}
              <Button size={'small'} onClick={() => assignRole(r.id)}>
                Agregar
              </Button>
            </Space>
          </div>
        );
      })}
    </>
  );
};

export default UserPermissionsManager;
