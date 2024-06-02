import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Empty, Input, Pagination, Popover, Select, Space, Tabs, Tooltip} from 'antd';
import {ArrowPathIcon, PlusCircleIcon} from '@heroicons/react/24/outline';
import {IdentificationIcon, UserCircleIcon, UserIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import {Profile, ResponsePagination} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ProfileEditor from '../../Components/ProfileEditor';
import ConfigAccounts from '../../../InboxManagement/Screens/ConfigOptions/ConfigAccounts';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import CreateUser from '../../Components/CreateUser';
import IconButton from '../../../CommonUI/IconButton';
import dayjs from 'dayjs';
import PersonSubscription from '../../../PaymentManagement/Components/PersonSubscription';

const Users = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState<string>();
  const [filterSubscription, setFilterSubscription] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, page_size: pageSize, search, subscription: filterSubscription},
    };
    setLoading(true);
    axios
      .get(`hr-management/profiles`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setProfiles(response.data.data);
          setPagination(response.data.meta);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, currentPage, pageSize, search, filterSubscription]);
  return (
    <>
      <ModuleSidebar
        loading={loading}
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
        header={
          <Space>
            <Input.Search
              allowClear
              placeholder={'Buscar por nombre'}
              size={'small'}
              onSearch={value => {
                setSearch(value);
                setCurrentPage(1);
              }}
            />
            <Select
              allowClear
              placeholder={'Suscripción'}
              size={'small'}
              onChange={value => setFilterSubscription(value)}
              options={[
                {label: 'Con alguna subscripción', value: 'any'},
                {label: 'Con subscripción activa', value: 'active'},
                {label: 'Con subscripción terminada', value: 'terminated'},
              ]}
            />
          </Space>
        }
        footer={
          <>
            <Space>
              <Pagination
                showSizeChanger={false}
                size={'small'}
                total={pagination?.total}
                pageSize={pagination?.per_page}
                current={pagination?.current_page}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
              <div>Total {pagination?.total}</div>
              <IconButton icon={<ArrowPathIcon />} onClick={() => setReload(!reload)} />
            </Space>
          </>
        }>
        <NavList>
          {profiles?.map((p, index) => {
            const isAdmin = !!p.user?.roles?.filter(r => r.name == 'admin').length;
            return (
              <NavListItem
                key={index}
                name={`${p.name} ${p.last_name || ''} ${isAdmin ? '*' : ''}`}
                caption={dayjs(p.created_at).fromNow() + (p.user ? ' | ' + p.user?.email : '')}
                icon={p.user ? <IdentificationIcon /> : <UserIcon />}
                path={`/accounts/${p.uuid}`}
              />
            );
          })}
        </NavList>
        {profiles?.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay personas registradas'} />
        )}
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
                label: 'Suscripciones',
                key: 'subscriptions',
                children: <PersonSubscription profileUuid={params.uuid} />,
              },
            ]}
          />
        )}
      </ModuleContent>
    </>
  );
};

export default Users;
