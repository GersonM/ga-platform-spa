import {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Drawer, Form, Input, Modal, Pagination, Select, Space, Tooltip} from 'antd';
import {
  TbFaceId,
  TbIdBadge2,
  TbLockCog,
  TbPencil,
  TbUser,
  TbUserOff,
  TbUserShield
} from 'react-icons/tb';
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
import UpdateUserPassword from "../../Components/UpdateUserPassword";
import CustomTag from "../../../CommonUI/CustomTag";
import Cookies from "js-cookie";
import AuthContext from "../../../Context/AuthContext.tsx";

interface ProfilesManagementProps {
  type?: string;
}

const ProfilesManagement = ({type}: ProfilesManagementProps) => {
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
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const {user} = useContext(AuthContext);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        page: currentPage, page_size: pageSize, search, subscription: filterSubscription,
        filter: type
      },
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
  }, [reload, currentPage, pageSize, search, filterSubscription, type]);

  const getSession = (u?: User) => {
    if (!u) {
      return;
    }
    axios
      .post('authentication/impersonation', {user_uuid: u.uuid})
      .then(response => {
        const oldSession = Cookies.get('session_token');
        if (oldSession) {
          Cookies.set('old_session_token', oldSession);
        }
        Cookies.set('session_token', response.data.token);
        location.reload();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
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
        return <Space>
          {
            user?.roles?.length > 0 ? user.roles.map((role: any, index: number) => {
              return (<CustomTag key={index} color={'blue-inverse'}>{role.name}</CustomTag>);
            }) : <small>Sin roles asignados</small>
          }
          <Tooltip title={'Editar roles'}>
            <IconButton small icon={<TbUserShield/>} disabled/>
          </Tooltip>
        </Space>;
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
      width: 170,
      render: (uuid: string, row: Profile) => {
        return (
          <Space wrap>
            <Tooltip title={'Editar'}>
              <IconButton small icon={<TbPencil/>} onClick={() => navigate(`/profiles/${uuid}`)}/>
            </Tooltip>
            <Tooltip title={'Cambiar contraseña'}>
              <IconButton small icon={<TbLockCog/>} onClick={() => {
                setSelectedProfile(row);
                setOpenChangePassword(true);
              }}/>
            </Tooltip>
            <Tooltip title={'Restringir acceso'}>
              <IconButton small icon={<TbUserOff/>} danger disabled/>
            </Tooltip>
            {user?.roles?.includes('admin') && row.user && (
              <Tooltip title={'Impersonation'}>
                <IconButton onClick={() => getSession(row.user)} small icon={<TbFaceId/>}/>
              </Tooltip>
            )
            }
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
          title={type == 'user' ? 'Usuarios' : 'Personas'}
          tools={`${pagination?.total} personas encontradas`}
          onAdd={() => setOpenCreateUser(true)}
        >
          <FilterForm>
            <Form.Item label={'Buscar'}>
              <Input.Search
                allowClear
                placeholder={'por nombre, documento o correo'}
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
        <TableList scroll={{x: 900}} columns={columns} dataSource={profiles}/>
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
        <Drawer
          destroyOnHidden
          open={openChangePassword}
          title={'Actualizar contraseña para ' + selectedProfile?.name}
          onClose={() => setOpenChangePassword(false)}>
          {selectedProfile && (
            <UpdateUserPassword
              onChange={() => {
                setOpenChangePassword(false);
              }}
              profile={selectedProfile}
            />
          )}
        </Drawer>
      </ModuleContent>
    </>
  );
};

export default ProfilesManagement;
