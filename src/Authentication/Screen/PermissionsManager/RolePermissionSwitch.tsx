import React, {useState} from 'react';
import {Switch} from 'antd';
import axios from 'axios';

import {Permission, Role} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface IRolePermissionSwitchProps {
  permission: Permission;
  role: Role;
}

const RolePermissionSwitch = ({permission, role}: IRolePermissionSwitchProps) => {
  const [loading, setLoading] = useState(false);

  const updatePermission = (checked: boolean) => {
    if (checked) {
      addPermission();
    } else {
      removePermission();
    }
  };

  const addPermission = () => {
    setLoading(true);
    axios
      .post(`authentication/roles/${role.id}/permissions`, {permission_id: permission.id})
      .then(() => {
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const removePermission = () => {
    setLoading(true);
    axios
      .delete(`authentication/roles/${role.id}/permissions/${permission.id}`)
      .then(() => {
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div className={'role-permissions-wrapper'}>
      <span className={'name'}>
        {permission.name}
        <small>{permission.name}</small>
      </span>
      <Switch
        defaultChecked={!!role.permissions.find(p => p.id == permission.id)}
        loading={loading}
        onChange={updatePermission}
      />
    </div>
  );
};

export default RolePermissionSwitch;
