import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Empty, Input, Pagination, Popover, Select, Space, Tabs, Tag, Tooltip} from 'antd';
import {ArrowPathIcon, PlusCircleIcon} from '@heroicons/react/24/outline';
import {IdentificationIcon, NoSymbolIcon, UserIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import {Profile, ResponsePagination} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ProfileEditor from '../../Components/ProfileEditor';
import CreateUser from '../../Components/CreateUser';
import IconButton from '../../../CommonUI/IconButton';
import PersonSubscription from '../../../PaymentManagement/Components/PersonSubscription';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import UserSessionsManager from '../../Components/UserSessionsManager';
import './styles.less';
import ProfilePayments from '../../../PaymentManagement/Components/ProfilePayments';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import ProfileActivity from '../../../EntityActivity/Components/ProfileActivity';
import FileActivityProfile from '../../../FileManagement/Components/FileActivityProfile';

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
              <IconButton icon={<PlusCircleIcon />} />
            </Tooltip>
          </Popover>
        }
        title={'Personas registradas'}
        header={
          <Space direction={'vertical'} style={{width: '100%'}}>
            <Input.Search
              style={{width: '100%'}}
              allowClear
              placeholder={'Buscar por nombre'}
              size={'small'}
              onSearch={value => {
                setSearch(value);
                setCurrentPage(1);
              }}
            />
            <Select
              style={{width: '100%'}}
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
            let rolesLabel: string = '';
            if (p.user?.roles && p.user?.roles?.length > 0) {
              rolesLabel = p.user.roles[0].name;
              if (p.user.roles.length > 1) {
                rolesLabel += ' +' + (p.user.roles.length - 1);
              }
            }
            return (
              <NavListItem
                key={index}
                name={
                  <Space>
                    {`${p.name} ${p.last_name || ''}`}
                    {rolesLabel && <Tag color={'blue'}>{rolesLabel}</Tag>}
                    {p.login_method === 'none' && <NoSymbolIcon width={15} />}
                  </Space>
                }
                caption={p.email || 'Sin correo'}
                image={p.avatar?.thumbnail}
                icon={p.user ? <IdentificationIcon color={p.user.disabled_at ? 'red' : ''} /> : <UserIcon />}
                path={`/accounts/${p.uuid}`}
              />
            );
          })}
        </NavList>
        {profiles?.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay personas registradas'} />
        )}
      </ModuleSidebar>
      <ModuleContent withSidebar>
        {params.uuid && (
          <Tabs
            onChange={tab => {
              navigate(`/accounts/${params.uuid}/${tab}`);
            }}
            className={'users-tab-bar'}
            type={'card'}
            centered
            destroyInactiveTabPane
            activeKey={params.tab}
            items={[
              {
                label: 'Información personal',
                style: {border: 3},
                key: 'info',
                children: (
                  <div className={'users-tab-content'}>
                    <ProfileEditor profileUuid={params.uuid} onCompleted={() => setReload(!reload)} />
                  </div>
                ),
              },
              {
                label: 'Sesiones',
                key: 'sessions',
                children: (
                  <div className={'users-tab-content'}>
                    <UserSessionsManager profileUuid={params.uuid} />
                  </div>
                ),
              },
              {
                label: 'Suscripciones',
                key: 'subscriptions',
                children: (
                  <div className={'users-tab-content'}>
                    <PersonSubscription profileUuid={params.uuid} />
                  </div>
                ),
              },
              {
                label: 'Finanzas',
                key: 'payments',
                children: (
                  <div className={'users-tab-content'}>
                    <ProfilePayments profileUuid={params.uuid} />
                  </div>
                ),
              },
              {
                label: 'Actividad',
                key: 'activity',
                children: (
                  <div className={'users-tab-content'}>
                    <ProfileActivity profileUuid={params.uuid} />
                  </div>
                ),
              },
              {
                label: 'Actividad de archivos',
                key: 'file-activity',
                children: (
                  <div className={'users-tab-content'}>
                    <FileActivityProfile profileUuid={params.uuid} />
                  </div>
                ),
              },
            ]}
          />
        )}
      </ModuleContent>
    </>
  );
};

export default Users;
