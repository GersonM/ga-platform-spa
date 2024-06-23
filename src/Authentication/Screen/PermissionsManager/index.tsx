import React, {useEffect, useState} from 'react';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Permission, Role} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Modal, Switch, Tabs} from 'antd';
import RolePermissionSwitch from './RolePermissionSwitch';
import AuthRoleForm from '../../Components/AuthRoleForm';

const PermissionsManager = () => {
  const [roles, setRoles] = useState<Role[]>();
  const [permissions, setPermissions] = useState<Permission[]>();
  const [reload, setReload] = useState(false);
  const [openRoleForm, setOpenRoleForm] = useState(false);

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

  const createRole = () => {
    axios
      .post(`authentication/roles`)
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
        onAdd={() => setOpenRoleForm(true)}
        title={'Roles y permisos'}
        tools={<PrimaryButton label={'Sincronizar permisos'} onClick={syncPermissions} />}
      />
      <div></div>
      <Tabs tabPosition={'left'}>
        {roles?.map((role, index) => (
          <Tabs.TabPane key={index} tab={role.name}>
            <h3>Permisos para {role.name}</h3>
            {permissions?.map((permission, index) => (
              <RolePermissionSwitch key={index} permission={permission} role={role} />
            ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
      <Modal
        title={'Crear role'}
        onCancel={() => setOpenRoleForm(false)}
        footer={null}
        open={openRoleForm}
        destroyOnClose>
        <AuthRoleForm />
      </Modal>
    </>
  );
};

export default PermissionsManager;
