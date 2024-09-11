import React, {useEffect, useState} from 'react';
import {Input, Pagination, Select, Space} from 'antd';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import {Client, Profile, ResponsePagination} from '../../../Types/api';
import ContractList from './ContractList';

import './styles.less';

const CommercialClients = () => {
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
      width: 280,
      render: (_uuid: string, row: Profile) => {
        return (
          <>
            {row.name} {row.last_name} <br />
            <small>
              <ProfileDocument profile={row} />
            </small>
          </>
        );
      },
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      width: 110,
    },
    {
      title: 'Contratos',
      dataIndex: 'client',
      render: (client: Client) => <ContractList contracts={client.contracts} />,
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
