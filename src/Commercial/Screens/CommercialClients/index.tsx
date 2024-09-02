import React, {useEffect, useState} from 'react';
import {Input, Pagination, Popconfirm, Select, Space, Tooltip} from 'antd';
import {ArrowRightIcon, TrashIcon} from '@heroicons/react/24/solid';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import IconButton from '../../../CommonUI/IconButton';
import {Profile, ResponsePagination} from '../../../Types/api';

const CommercialClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState();
  const [searchText, setSearchText] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: searchText,
        page: currentPage,
        page_size: pageSize,
      },
    };

    setLoading(true);
    axios
      .get(`commercial/clients`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setClients(response.data.data);
          setPagination(response.data.meta);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [searchText, currentPage, pageSize, reload]);

  const deleteClient = (uuid: string) => {
    axios
      .delete(`commercial/clients/${uuid}`)
      .then(() => {
        setReload(true);
      })
      .catch(error => ErrorHandler.showNotification(error));
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'entity',
      render: (entity: Profile) => {
        return entity.name + ' ' + entity.last_name;
      },
    },
    {
      title: 'Documento',
      dataIndex: 'entity',
      render: (entity: Profile) => {
        return <ProfileDocument profile={entity} />;
      },
    },
    {
      title: 'Dirección',
      dataIndex: 'entity',
      render: (entity: Profile) => {
        return entity.address;
      },
    },
    {
      title: 'E-mail',
      dataIndex: 'entity',
      render: (entity: Profile) => {
        return entity.email;
      },
    },
    {title: 'Restringido', dataIndex: 'is_disabled', render: (value: boolean) => (value ? 'Si' : 'No')},
    {
      title: 'Configurado',
      dataIndex: 'setup_completed',
      render: (value: boolean) => (value ? 'Si' : 'No'),
    },
    {
      title: 'Contratos',
      dataIndex: 'contracts',
      render: (contracts: any[]) => {
        return contracts.map(c => c.amount_string);
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Space>
          <Popconfirm
            title={'¿Seguro que quieres eliminar este cliente?'}
            description={
              <span style={{maxWidth: 300, display: 'block'}}>
                Este proceso no se puede revertir y eliminará toda la información relacionada con este cliente
              </span>
            }
            onConfirm={() => deleteClient(uuid)}>
            <IconButton small danger icon={<TrashIcon />} />
          </Popconfirm>
          <Tooltip title={'Ver más detalles'}>
            <IconButton
              onClick={() => {
                navigate(`/commercial/clients/${uuid}`);
              }}
              small
              type={'link'}
              icon={<ArrowRightIcon />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Clientes'} onRefresh={() => setReload(!reload)}>
        <Space>
          <Input.Search onSearch={value => setSearchText(value)} placeholder={'Buscar por nombre, dni o correo'} />
          <Select
            placeholder={'Etapa'}
            style={{width: 100}}
            options={[
              {label: 'Etapa IV', value: 4},
              {label: 'Etapa III', value: 3},
              {label: 'Etapa II', value: 2},
              {label: 'Etapa I', value: 1},
            ]}
          />
        </Space>
      </ContentHeader>
      <TableList loading={loading} columns={columns} dataSource={clients} pagination={false} />
      {pagination && (
        <Pagination
          size="small"
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          total={pagination.total}
          current={pagination.current_page}
          pageSize={pagination.per_page}
        />
      )}
    </ModuleContent>
  );
};

export default CommercialClients;
