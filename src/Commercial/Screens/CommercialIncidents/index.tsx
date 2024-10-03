import React, {useEffect, useState} from 'react';
import {Input, Modal, Pagination, Popconfirm, Select, Space, Table, Tooltip} from 'antd';
import {TrashIcon} from '@heroicons/react/16/solid';
import {useNavigate} from 'react-router-dom';
import {PiCheckBold, PiCross, PiProhibit} from 'react-icons/pi';
import dayjs from 'dayjs';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {EntityActivity, Profile, ResponsePagination} from '../../../Types/api';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import EntityActivityIcon from '../../../CommonUI/EntityActivityManager/EntityActivityIcon';
import EstateContractAddress from '../../Components/RealState/EstateContractAddress';
import IconButton from '../../../CommonUI/IconButton';
import ScheduleActivityForm from '../../../EntityActivity/Components/ScheduleActivityForm';
import './styles.less';

const CommercialIncidents = () => {
  const [clients, setClients] = useState<Profile[]>();
  const [searchText, setSearchText] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>();
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<EntityActivity>();
  const [openActivityEditor, setOpenActivityEditor] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: searchText,
        page: currentPage,
        page_size: pageSize,
        type: typeFilter,
        status: statusFilter,
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
  }, [searchText, currentPage, pageSize, reload, typeFilter, statusFilter]);

  const completeTask = (uuid: string, resolve: boolean) => {
    axios
      .post(resolve ? `entity-activity/${uuid}/pending` : `entity-activity/${uuid}/complete`, {})
      .then(response => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const deleteTask = (uuid: string) => {
    axios
      .delete(`entity-activity/${uuid}`, {})
      .then(response => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const columns: any[] = [
    {
      title: 'Tipo',
      width: 50,
      align: 'center',
      dataIndex: 'type',
      render: (type: string, activity: EntityActivity) => {
        return <EntityActivityIcon type={type} size={25} activity={activity} />;
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
      width: 190,
      render: (profile: Profile, row: EntityActivity) => {
        return (
          <>
            <strong>Autor:</strong> {profile.name}
            {row.type !== 'entry' && (
              <>
                <br />
                <strong>Responsable:</strong>{' '}
                <>
                  {row.assigned_to ? (
                    <>{row.assigned_to.name}</>
                  ) : (
                    <PrimaryButton
                      ghost
                      size={'small'}
                      label={'Asignar'}
                      onClick={() => {
                        setOpenActivityEditor(true);
                        setSelectedActivity(row);
                      }}
                    />
                  )}
                </>
              </>
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
        return dayjs(date).format('DD-MM-YYYY HH:mm a');
      },
    },
    {
      title: 'Expira',
      dataIndex: 'expired_at',
      width: 110,
      render: (date: string, row: any) => {
        return date ? (
          dayjs(date).fromNow()
        ) : (
          <PrimaryButton
            ghost
            size={'small'}
            label={'Asignar fecha'}
            onClick={() => {
              setOpenActivityEditor(true);
              setSelectedActivity(row);
            }}
          />
        );
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      width: 90,
      render: (uuid: string, row: EntityActivity) => {
        return (
          <Space>
            <Popconfirm
              onConfirm={() => completeTask(uuid, !!row.completed_at)}
              title={row.completed_at ? 'Marcar tarea como no resuelta' : 'Vas a marcar esta tarea como completada'}
              description={
                row.completed_at ? 'Se reactivarán las alertas para esta tarea' : 'No se emitirán nuevas alertas'
              }>
              <Tooltip
                title={row.completed_at ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
                placement={'bottom'}>
                <IconButton icon={row.completed_at ? <PiProhibit size={17} /> : <PiCheckBold size={17} />} />
              </Tooltip>
            </Popconfirm>
            <Popconfirm title={'Seguro que quieres eliminar esta incidencia?'} onConfirm={() => deleteTask(uuid)}>
              <IconButton small icon={<TrashIcon />} danger />
            </Popconfirm>
          </Space>
        );
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
            placeholder={'Tipo'}
            allowClear
            onChange={value => setTypeFilter(value)}
            style={{width: 100}}
            options={[
              {label: 'Alertas', value: 'alert'},
              {label: 'Mensaje', value: 'entry'},
            ]}
          />
          <Select
            placeholder={'Pendientes'}
            allowClear
            onChange={value => setStatusFilter(value)}
            style={{width: 120}}
            options={[
              {label: 'Completados', value: 'completed'},
              {label: 'Pendientes', value: 'pending'},
              {label: 'Todos', value: 'all'},
            ]}
          />
        </Space>
      </ContentHeader>
      <div style={{marginBottom: '10px'}}>
        <Table
          size="small"
          scroll={{x: 1200}}
          loading={loading}
          columns={columns}
          dataSource={clients}
          pagination={false}
        />
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
      <Modal
        open={openActivityEditor}
        title={'Editar actividad'}
        destroyOnClose
        footer={false}
        onCancel={() => setOpenActivityEditor(false)}>
        {selectedActivity && (
          <ScheduleActivityForm
            activity={selectedActivity}
            onComplete={() => {
              setOpenActivityEditor(false);
              setReload(!reload);
            }}
          />
        )}
      </Modal>
    </ModuleContent>
  );
};

export default CommercialIncidents;
