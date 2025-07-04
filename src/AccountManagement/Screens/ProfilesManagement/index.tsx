import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Modal, Pagination, Popconfirm, Select, Space, Tag, Tooltip} from 'antd';
import {TbIdBadge2, TbLockCog, TbPencil, TbTrash, TbUser, TbUserOff, TbUserShield} from 'react-icons/tb';
import {NoSymbolIcon} from '@heroicons/react/24/solid';
import axios from 'axios';
import dayjs from 'dayjs';

import type {Profile, ResponsePagination, User} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ModuleContent from '../../../CommonUI/ModuleContent';
import CreateUser from '../../Components/CreateUser';
import IconButton from '../../../CommonUI/IconButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import FilterForm from '../../../CommonUI/FilterForm';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import './styles.less';

const ProfilesManagement = () => {
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

  const columns = [
    {
      title: 'Nombre',
      dataIndex: '_name',
      width: 280,
      render: (_name: string, row: Profile) => {
        return <ProfileChip profile={row}/>;
      },
    },
    {
      title: 'Login',
      dataIndex: 'user',
      align: 'center',
      width: 80,
      render: (user: User, profile: Profile) => {
        return (
          <Space>
            {user ? <TbIdBadge2 size={20} color={user.disabled_at ? 'red' : ''}/> : <TbUser size={18}/>}
            {profile.login_method === 'none' && <NoSymbolIcon width={15}/>}
          </Space>
        );
      },
    },
    {
      title: 'Document',
      responsive: ['lg'],
      dataIndex: 'uuid',
      width: 160,
      render: (_uuid: string, profile: Profile) => {
        return <ProfileDocument profile={profile}/>;
      },
    },
    {
      title: 'Roles',
      dataIndex: 'user',
      render: (user: any) => {
        if (user?.roles?.length > 0) {
          return user.roles.map((role: any, index: number) => {
            return (
              <Tag key={index} color={'blue-inverse'}>
                {role.name}
              </Tag>
            );
          });
        }
        return <Tag color={'grey'}>Sin rol</Tag>;
      },
    },
    {
      title: 'Última conexión',
      dataIndex: 'user',
      width: 130,
      render: (user?: User) => {
        if (!user || !user.last_login_at) return 'Nunca';
        return (
          <Tooltip title={dayjs(user.last_login_at).format('dddd DD/MM/YYYY [a las] HH:mm a')}>
            {dayjs(user.last_login_at).fromNow()}
          </Tooltip>
        );
      },
    },
    {
      title: 'Creado en',
      dataIndex: 'created_at',
      width: 110,
      responsive: ['lg'],
      render: (created_at: string) => {
        return (
          <Tooltip title={dayjs(created_at).format('dddd DD/MM/YYYY [a las] HH:mm a')}>
            {dayjs(created_at).fromNow()}
          </Tooltip>
        );
      },
    },
    {
      dataIndex: 'uuid',
      responsive: ['lg'],
      width: 230,
      render: (uuid: string) => {
        return (
          <Space wrap>
            <Tooltip title={'Editar'}>
              <IconButton icon={<TbPencil/>} onClick={() => navigate(`/profiles/${uuid}`)}/>
            </Tooltip>
            <Tooltip title={'Cambiar contraseña'}>
              <IconButton icon={<TbLockCog/>} disabled/>
            </Tooltip>
            <Tooltip title={'Editar roles'}>
              <IconButton icon={<TbUserShield/>} disabled/>
            </Tooltip>
            <Tooltip title={'Bloquear usuario'}>
              <IconButton icon={<TbUserOff/>} danger disabled/>
            </Tooltip>
            <Tooltip title={'Eliminar usuario'}>
              <Popconfirm
                title={'¿Quieres eliminar este usuario?'}
                description={'Toda la información relacionada será eliminada también'}
                onConfirm={() => setReload(!reload)}>
                <IconButton icon={<TbTrash/>} danger disabled/>
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ModuleContent withSidebar>
        <ContentHeader
          loading={loading}
          onRefresh={() => {
            setReload(!reload);
          }}
          title={'Usuarios'}
          tools={`${pagination?.total} personas encontradas`}
          onAdd={() => setOpenCreateUser(true)}
        >
          <FilterForm>
            <Form.Item label={'Buscar'}>
              <Input.Search
                allowClear
                placeholder={'por nombre'}
                onSearch={value => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
              />
            </Form.Item>
            <Form.Item>
              <Select
                allowClear
                popupMatchSelectWidth={false}
                placeholder={'Suscripción'}
                onChange={value => setFilterSubscription(value)}
                options={[
                  {label: 'Con alguna subscripción', value: 'any'},
                  {label: 'Con subscripción activa', value: 'active'},
                  {label: 'Con subscripción terminada', value: 'terminated'},
                ]}
              />
            </Form.Item>
          </FilterForm>
        </ContentHeader>
        <TableList columns={columns} dataSource={profiles}/>
        <Pagination
          align={'center'}
          showSizeChanger={false}
          total={pagination?.total}
          pageSize={pagination?.per_page}
          current={pagination?.current_page}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
        <Modal open={openCreateUser} destroyOnHidden footer={false} onCancel={() => setOpenCreateUser(false)}>
          <CreateUser
            onCompleted={() => {
              setReload(!reload);
              setOpenCreateUser(false);
            }}
          />
        </Modal>
      </ModuleContent>
    </>
  );
};

export default ProfilesManagement;
