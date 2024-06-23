import React, {useEffect, useState} from 'react';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Permission, Role} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Switch, Tabs} from 'antd';

const PermissionsManager = () => {
  const [roles, setRoles] = useState<Role[]>();
  const [permissions, setPermissions] = useState<Permission[]>();
  const [reload, setReload] = useState(false);

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
  }, [reload]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`authentication/permissions`, config)
      .then(response => {
        if (response) {
          setPermissions(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const syncPermissions = () => {
    axios
      .post(`authentication/permissions/sync`)
      .then(response => {
        if (response) {
          setPermissions(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <>
      <ContentHeader
        onRefresh={() => setReload(!reload)}
        title={'Roles y permisos'}
        tools={<PrimaryButton label={'Sincronizar permisos'} onClick={syncPermissions} />}
      />
      <Tabs tabPosition={'left'}>
        {roles?.map((role, index) => (
          <Tabs.TabPane tab={role.name}>
            {permissions?.map((permission, index) => (
              <div key={index}>
                {permission.name} <Switch />
              </div>
            ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  );
};

export default PermissionsManager;
