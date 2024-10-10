import React, {useEffect, useState} from 'react';
import {Avatar, Image, Pagination, Popconfirm, Space, Table, Tooltip} from 'antd';
import {PiCheckBold, PiProhibit} from 'react-icons/pi';
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

import {EntityActivity, File, Profile, ResponsePagination} from '../../../Types/api';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import EntityActivityIcon from '../../../CommonUI/EntityActivityManager/EntityActivityIcon';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import EstateContractAddress from '../../../Commercial/Components/RealState/EstateContractAddress';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileIcon from '../../../FileManagement/Components/FileIcon';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';

const MyComponent = () => {
  const [activities, setActivities] = useState<EntityActivity[]>();
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
      .get(`entity-activity/my-tasks`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setActivities(response.data.data);
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
      title: 'Reportado',
      dataIndex: 'profile',
      width: 180,
      render: (profile: Profile, row: EntityActivity) => {
        return <ProfileChip profile={profile} caption={dayjs(row.created_at).format('DD-MM-YYYY [a las] HH:mm a')} />;
      },
    },
    {
      title: 'Mensaje',
      dataIndex: 'comment',
      fixed: 'left',
      width: 320,
    },
    {
      title: 'Archivos',
      dataIndex: 'attachments',
      width: 190,
      render: (attachments: File[], row: EntityActivity) => {
        return (
          <>
            <Image.PreviewGroup>
              {attachments?.map((at: File) => (
                <>
                  {at.type.includes('ima') ? (
                    <Image
                      key={at.uuid}
                      preview={{
                        destroyOnClose: true,
                        src: at.source,
                      }}
                      loading={'lazy'}
                      src={at.thumbnail}
                      width={30}
                    />
                  ) : (
                    <Tooltip title={at.name}>
                      <a href={at.source} target={'_blank'}>
                        <FileIcon file={at} size={25} />
                      </a>
                    </Tooltip>
                  )}
                </>
              ))}
            </Image.PreviewGroup>
          </>
        );
      },
    },
    {
      title: 'Asunto',
      dataIndex: 'entity',
      width: 200,
      render: (entity?: any) => {
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
          </Space>
        );
      },
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Mis tareas asignadas'} onRefresh={() => setReload(!reload)} loading={loading} />
      <div style={{marginBottom: '10px'}}>
        <Table
          rowKey={'uuid'}
          size="small"
          scroll={{x: 1200}}
          loading={loading}
          columns={columns}
          dataSource={activities}
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
    </ModuleContent>
  );
};

export default MyComponent;
