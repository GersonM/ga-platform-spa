import {useEffect, useState} from 'react';
import {TbBuilding, TbPencil, TbStarFilled, TbTrash} from 'react-icons/tb';
import {Modal, Popconfirm, Space, Tag, Tooltip} from 'antd';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import type {TenantConfig} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import WorkspaceForm from '../../Components/WorkspaceForm';

const WorkspaceManagement = () => {
  const [workspaces, setWorkspaces] = useState<TenantConfig[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const [openAddTenant, setOpenAddTenant] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`workspaces`, config)
      .then(response => {
        if (response) {
          setWorkspaces(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const removeWorkspace = (tenantId: string) => {
    setLoading(true);
    axios
      .delete(`workspaces/${tenantId}`)
      .then(() => {
        setLoading(false);
        setReload(!reload);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const columns = [
    {
      dataIndex: 'favicon',
      width: 70,
      align: 'center',
      render: (favicon: string, tenant: TenantConfig) =>
        favicon ? <img alt={tenant.id} style={{width: 40}} src={favicon} /> : <TbBuilding size={30} />,
    },
    {
      title: 'Nombre',
      width: 160,
      dataIndex: 'config',
      render: (config: any, tenant: TenantConfig) => (
        <>
          {config.name} {tenant.is_cluster_owner && <TbStarFilled size={10} />}
          <br />
          <small>{config.id}</small>
        </>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'primary_color',
      responsive: ['md'],
      render: (primary_color: string) => (primary_color ? <Tag color={primary_color}>{primary_color}</Tag> : 'Default'),
    },
    {
      title: 'Personas',
      dataIndex: 'total_profiles',
    },
    {
      title: 'Empresas',
      dataIndex: 'total_companies',
      responsive: ['md'],
    },
    {
      title: 'Módulos',
      dataIndex: 'modules',
      render: (modules: string[]) => modules.join(', '),
    },
    {
      dataIndex: 'id',
      render: (id: string) => (
        <Space>
          <Tooltip title={'Editar'}>
            <IconButton icon={<TbPencil size={18} />} onClick={() => navigate(`/config/workspaces/${id}`)} />
          </Tooltip>
          <Popconfirm
            title={'¿Quieres eliminar este workspace?'}
            description={'Esto eliminará la base de datos y todos los archivos cargados por completo'}
            onConfirm={() => removeWorkspace(id)}>
            <IconButton icon={<TbTrash size={18} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <ContentHeader
        loading={loading}
        title={'Configuración de workspaces'}
        onAdd={() => setOpenAddTenant(true)}
        onRefresh={() => setReload(!reload)}>
        <p>
          Los espacios de trabajo o workspaces, permiten gestionar la información de una empresa de manera
          independiente, tienen su propio espacio de trabajo y la información no se comparte con ningún otro entorno
        </p>
      </ContentHeader>
      <TableList rowKey={'id'} columns={columns} dataSource={workspaces} />

      <Modal
        title={'Crear nuevo workspace'}
        open={openAddTenant}
        onCancel={() => setOpenAddTenant(false)}
        destroyOnHidden
        footer={false}>
        <WorkspaceForm
          onComplete={() => {
            setOpenAddTenant(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </div>
  );
};

export default WorkspaceManagement;
