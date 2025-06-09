import React, {useEffect, useState} from 'react';
import {TbBuilding, TbPencil, TbStarFilled, TbTrash} from 'react-icons/tb';
import {Image, Popconfirm, Space, Tag, Tooltip} from 'antd';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {TenantConfig} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import IconButton from '../../../CommonUI/IconButton';

const WorkspaceManagement = () => {
  const [workspaces, setWorkspaces] = useState<TenantConfig[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();

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

  const columns = [
    {
      dataIndex: 'favicon',
      width: 70,
      align: 'center',
      render: (favicon: string) => (favicon ? <Image width={40} src={favicon} /> : <TbBuilding />),
    },
    {
      title: 'Nombre',
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
          <Popconfirm title={'¿Quieres eliminar este workspace?'}>
            <IconButton icon={<TbTrash size={18} />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <ContentHeader title={'Configuración de workspaces'} onRefresh={() => setReload(!reload)} />
      <TableList rowKey={'id'} columns={columns} dataSource={workspaces} />
    </div>
  );
};

export default WorkspaceManagement;
