import React, {useEffect, useState} from 'react';
import {Input, Pagination, Popconfirm, Popover, Select, Space, Tag, Tooltip} from 'antd';
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
  const [clients, setClients] = useState<Profile[]>();
  const [searchText, setSearchText] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: searchText,
        page: currentPage,
        page_size: pageSize,
        stage: stageFilter,
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
  }, [searchText, currentPage, pageSize, reload, stageFilter]);

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
      dataIndex: 'uuid',
      render: (_uuid: string, row: Profile) => {
        return row.name + ' ' + row.last_name;
      },
    },
    {
      title: 'Documento',
      dataIndex: 'uuid',
      render: (_uuid: string, entity: Profile) => {
        return <ProfileDocument profile={entity} />;
      },
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
    },
    {
      title: 'E-mail',
      dataIndex: 'personal_email',
    },
    {
      title: 'Contratos',
      dataIndex: 'client',
      render: (client: any) => {
        return client?.contracts?.map((c: any, index: number) => {
          return (
            <div key={index}>
              <Popover
                placement={'left'}
                content={
                  <div>
                    <ul>
                      {c.items.map((item: any, index: number) => {
                        return (
                          <li key={index}>
                            {item.description}: {item.value}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                }>
                {c.amount_string} {c.provided_at && <Tag>asdf</Tag>}
              </Popover>
            </div>
          );
        });
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
      <ContentHeader tools={'Total: ' + pagination?.total} title={'Clientes'} onRefresh={() => setReload(!reload)}>
        <Space>
          <Input.Search
            allowClear
            onSearch={value => setSearchText(value)}
            placeholder={'Buscar por nombre, dni o correo'}
          />
          <Select
            placeholder={'Etapa'}
            allowClear
            onChange={value => setStageFilter(value)}
            style={{width: 100}}
            options={[
              {label: 'Etapa IV', value: 'IV'},
              {label: 'Etapa III', value: 'III'},
              {label: 'Etapa II', value: 'II'},
              {label: 'Etapa I', value: 'I'},
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
