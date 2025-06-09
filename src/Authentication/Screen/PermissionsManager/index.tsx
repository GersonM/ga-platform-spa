import {useEffect, useState} from 'react';
import axios from 'axios';
import {Divider, Modal, Popconfirm, Space, Tabs} from 'antd';
import {TrashIcon, PencilIcon} from '@heroicons/react/24/solid';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Permission, Role} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RolePermissionSwitch from './RolePermissionSwitch';
import AuthRoleForm from '../../Components/AuthRoleForm';

import './styles.less';

const PermissionsManager = () => {
  const [roles, setRoles] = useState<Role[]>();
  const [permissions, setPermissions] = useState<any>();
  const [reload, setReload] = useState(false);
  const [openRoleForm, setOpenRoleForm] = useState(false);
  const [syncing, setSyncing] = useState(false);

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
          let p: any = {};
          for (const r of response.data) {
            if (!p[r.group]) {
              p[r.group] = [];
            }
            p[r.group].push(r);
          }
          setPermissions(p);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const syncPermissions = () => {
    setSyncing(true);
    axios
      .post(`authentication/permissions/sync`)
      .then(() => {
        setSyncing(false);
        setReload(!reload);
      })
      .catch(e => {
        setSyncing(false);
        ErrorHandler.showNotification(e);
      });
  };

  const deleteRole = (role: Role) => {
    axios
      .delete(`authentication/roles/${role.id}`)
      .then(() => {})
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
        tools={<PrimaryButton loading={syncing} label={'Sincronizar permisos'} onClick={syncPermissions} />}
      />
      <p>Los roles permiten agrupar múltiples permisos para asignarlos fácilmente a un usuario</p>
      <Tabs
        animated={true}
        items={roles?.map(role => ({
          key: role.name,
          label: (
            <div className={'tab-name'}>
              <span className={'name'}>{role.name}</span>
              <small>{role.permissions.length} permisos</small>
            </div>
          ),
          children: (
            <>
              <h3>Permisos para {role.name}</h3>
              <Space>
                <PrimaryButton icon={<PencilIcon />} ghost label={'Editar rol'} />
                <Popconfirm
                  onConfirm={() => deleteRole(role)}
                  title={
                    <>
                      Al eliminar el rol se elimina todas las relaciones hechas, <br /> ¿Quieres continuar?
                    </>
                  }>
                  <PrimaryButton icon={<TrashIcon />} ghost danger label={'Eliminar rol'} />
                </Popconfirm>
              </Space>
              <br />
              {permissions &&
                Object.keys(permissions).map(p => {
                  return (
                    <div key={p} className={'permissions-group'}>
                      <Divider orientation={'left'} style={{textTransform: 'capitalize'}}>
                        {p.replace('-', ' ')}
                      </Divider>
                      <div className={'role-permissions-list'}>
                        {permissions[p].map((permission: Permission, index: number) => (
                          <RolePermissionSwitch key={index} permission={permission} role={role} />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </>
          ),
        }))}
      />

      <Modal
        title={'Crear role'}
        onCancel={() => setOpenRoleForm(false)}
        footer={null}
        open={openRoleForm}
        destroyOnClose>
        <AuthRoleForm
          onComplete={() => {
            setOpenRoleForm(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </>
  );
};

export default PermissionsManager;
