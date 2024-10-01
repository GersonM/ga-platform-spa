import React, {useEffect, useState} from 'react';
import {Input, Pagination, Select, Space} from 'antd';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import {Profile, ResponsePagination} from '../../../Types/api';

import './styles.less';
import dayjs from 'dayjs';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import EntityActivityIcon from '../../../CommonUI/EntityActivityManager/EntityActivityIcon';
import EstateContractAddress from '../../Components/RealState/EstateContractAddress';
import {useNavigate} from 'react-router-dom';

const CommercialIncidents = () => {
  const [clients, setClients] = useState<Profile[]>();
  const [searchText, setSearchText] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commercialStats, setCommercialStats] = useState<any>();
  const [stageFilter, setStageFilter] = useState<string>();
  const [typeFilter, setTypeFilter] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: searchText,
        page: currentPage,
        page_size: pageSize,
        stage: stageFilter,
        type: typeFilter,
      },
    };

    setLoading(true);
    axios
      .get(`entity-activity`, config)
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
  }, [searchText, currentPage, pageSize, reload, stageFilter, typeFilter]);

  const columns = [
    {
      title: 'Tipo',
      width: 50,
      align: 'center',
      dataIndex: 'type',
      render: (type: string) => {
        return <EntityActivityIcon type={type} size={25} />;
      },
    },
    {
      title: 'Mensaje',
      dataIndex: 'comment',
      fixed: 'left',
      width: 320,
    },
    {
      title: 'Reportado por',
      dataIndex: 'profile',
      width: 160,
      render: (profile: Profile) => {
        return <>{profile.name}</>;
      },
    },
    {
      title: 'Responsable',
      dataIndex: 'assigned_to',
      width: 150,
      render: (profile: Profile) => {
        return (
          <>
            {profile ? (
              <>
                {profile.name} <br />
              </>
            ) : (
              <PrimaryButton ghost size={'small'} label={'Asignar'} />
            )}
          </>
        );
      },
    },
    {
      title: 'Asunto',
      dataIndex: 'entity',
      width: 200,
      render: (entity: any) => {
        return (
          <EstateContractAddress
            contract={entity}
            onEdit={() => {
              navigate(`/commercial/contracts/${entity.uuid}`);
            }}
          />
        );
      },
    },
    {
      title: 'Fecha del reporte',
      dataIndex: 'created_at',
      width: 160,
      render: (date: string) => {
        return dayjs(date).format('DD-MM-YYYY HH:mm:ss');
      },
    },
    {
      title: 'Expira',
      dataIndex: 'expired_at',
      width: 110,
      render: (date: string) => {
        return date ? dayjs(date).fromNow() : <PrimaryButton ghost size={'small'} label={'Asignar fecha'} />;
      },
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader tools={'Total: ' + pagination?.total} title={'Incidencias'} onRefresh={() => setReload(!reload)}>
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
          <Select
            placeholder={'Tipo'}
            allowClear
            onChange={value => setTypeFilter(value)}
            style={{width: 100}}
            options={[
              {label: 'Alertas', value: 'alert'},
              {label: 'Mensaje', value: 'entry'},
            ]}
          />
        </Space>
      </ContentHeader>
      <div>
        <TableList scroll={{x: 1200}} loading={loading} columns={columns} dataSource={clients} pagination={false} />
      </div>
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

export default CommercialIncidents;
