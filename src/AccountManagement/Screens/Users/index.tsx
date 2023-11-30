import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Pagination, Popover, Tabs, Tooltip} from 'antd';
import {PlusCircleIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import {Profile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ProfileEditor from '../../Components/ProfileEditor';
import ConfigAccounts from '../../../InboxManagement/Screens/ConfigOptions/ConfigAccounts';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import CreateUser from '../../Components/CreateUser';

const Users = () => {
  const [profiles, setProfiles] = useState<Profile[]>();
  const [reload, setReload] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [openCreateUser, setOpenCreateUser] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`hr-management/profiles`, config)
      .then(response => {
        if (response) {
          setProfiles(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);
  return (
    <>
      <ModuleSidebar
        actions={
          <Popover
            open={openCreateUser}
            content={
              <CreateUser
                onCompleted={() => {
                  setReload(!reload);
                  setOpenCreateUser(false);
                }}
              />
            }
            onOpenChange={value => {
              setOpenCreateUser(value);
            }}
            trigger={'click'}>
            <Tooltip title={'Registrar nuevo usuario'} placement={'left'}>
              <Button type={'text'} shape={'circle'}>
                <PlusCircleIcon height={24} />
              </Button>
            </Tooltip>
          </Popover>
        }
        title={'Usuarios registrados'}
        footer={<Pagination size={'small'} total={20} current={1} />}>
        <NavList>
          {profiles?.map(p => (
            <NavListItem name={`${p.name} ${p.last_name || ''}`} caption={p.email} path={`/accounts/${p.uuid}`} />
          ))}
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        {params.uuid && (
          <Tabs
            animated={{inkBar: true, tabPane: true}}
            onChange={tab => {
              navigate(`/accounts/${params.uuid}/${tab}`);
            }}
            activeKey={params.tab}
            items={[
              {
                label: 'Información personal',
                key: 'info',
                children: <ProfileEditor profileUuid={params.uuid} onCompleted={() => setReload(!reload)} />,
              },
              {
                label: 'Permisos',
                key: 'permissions',
                children: <ConfigAccounts />,
              },
            ]}
          />
        )}
      </ModuleContent>
    </>
  );
};

export default Users;
