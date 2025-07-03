import {useEffect, useState} from 'react';
import axios from 'axios';
import {Divider, Modal, Popconfirm, Space, Tabs} from 'antd';
import {TrashIcon, PencilIcon} from '@heroicons/react/24/solid';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import type {Permission, Role} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RolePermissionSwitch from './RolePermissionSwitch';
import AuthRoleForm from '../../Components/AuthRoleForm';

import './styles.less';
import ModalView from "../../../CommonUI/ModalView";
import {TbPencil, TbTrash} from "react-icons/tb";

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
      .then(() => {
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
        tools={<PrimaryButton loading={syncing} label={'Sincronizar permisos'} onClick={syncPermissions}/>}
      />
      <p>Los roles permiten agrupar múltiples permisos para asignarlos fácilmente a un usuario</p>
      <Tabs
        animated={true}
        items={roles?.map(role => ({
          key: role.name,
          label: (
            <div className={'tab-name'}>
              <span className={'name'}>{role.name}</span>
              <small>{role.name == 'admin' ? 'Todos' : `${role.permissions.length} permisos`}</small>
            </div>
          ),
          children: (
            <>
              <p>Permisos para {role.name}</p>
              {role.name != 'admin' &&
                <Space>
                  <PrimaryButton icon={<TbPencil/>} ghost label={'Editar rol'}/>
                  <Popconfirm
                    onConfirm={() => deleteRole(role)}
                    title={'¿Quieres eliminar este rol?'}>
                    <PrimaryButton icon={<TbTrash/>} ghost danger label={'Eliminar rol'}/>
                  </Popconfirm>
                </Space>
              }
              {permissions &&
                Object.keys(permissions).map(p => {
                  return (
                    <div key={p} className={'permissions-group'}>
                      <Divider orientation={'left'} style={{textTransform: 'capitalize'}}>
                        {p.replace('-', ' ')}
                      </Divider>
                      <div className={'role-permissions-list'}>
                        {permissions[p].map((permission: Permission, index: number) => (
                          <RolePermissionSwitch key={index} permission={permission} role={role}/>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </>
          ),
        }))}
      />

      <ModalView
        title={'Crear role'}
        onCancel={() => setOpenRoleForm(false)}
        open={openRoleForm}
      >
        <AuthRoleForm
          onComplete={() => {
            setOpenRoleForm(false);
            setReload(!reload);
          }}
        />
      </ModalView>
    </>
  );
};

export default PermissionsManager;
