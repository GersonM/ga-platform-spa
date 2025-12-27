import {useContext, useEffect, useState} from 'react';
import {Avatar, Image, Pagination, Popconfirm, Progress, Statistic, Tooltip} from 'antd';
import {PiCheckBold, PiProhibit} from 'react-icons/pi';
import dayjs from 'dayjs';
import axios from 'axios';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import type {EntityActivity, ApiFile, ResponsePagination} from '../../../Types/api';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import EntityActivityIcon from '../../../CommonUI/EntityActivityManager/EntityActivityIcon';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileIcon from '../../../FileManagement/Components/FileIcon';
import AuthContext from '../../../Context/AuthContext';
import './styles.less';
import CustomTag from "../../../CommonUI/CustomTag";
import EntityActivityCardViewer from "../../Components/EntityActivityCardViewer";

const MyComponent = () => {
  const [activities, setActivities] = useState<EntityActivity[]>();
  const [searchText, _setSearchText] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [typeFilter, _setTypeFilter] = useState<string>();
  const [statusFilter, _setStatusFilter] = useState<string>();
  const [selectedActivity, setSelectedActivity] = useState<EntityActivity>();
  const [openActivityEditor, setOpenActivityEditor] = useState(false);
  const {updateActivityCount, activityCount} = useContext(AuthContext);

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
      .then(_response => {
        setLoading(false);
        if (_response) {
          setActivities(_response.data.data);
          setPagination(_response.data.meta);
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
      .then(_response => {
        setReload(!reload);
        if (updateActivityCount) {
          updateActivityCount();
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader
        title={'Mis tareas asignadas'}
        onRefresh={() => setReload(!reload)}
        loading={loading}
        tools={activityCount && (
          <>
            <Progress
              showInfo
              type={'dashboard'}
              size={40}
              percent={Math.round((activityCount?.completed * 100) / activityCount.total)}
            />
            <Statistic title={'Pendientes'} value={activityCount?.pending}/>
            <Statistic title={'Vencidas'} value={activityCount?.expired}/>
          </>
        )}
      />
      <DndProvider backend={HTML5Backend}>
      <div className={'activity-board'}>
        <div className="board-list">
          <div className="title"><CustomTag>{activities?.length}</CustomTag> Pendientes</div>
          <div className="items">
            {activities?.map((activity, index) => (
              <div key={index} className="activity-card" onClick={() => {
                setSelectedActivity(activity);
                setOpenActivityEditor(true);
              }}>
                  <EntityActivityIcon type={activity.type} size={15} activity={activity}/>
                {activity.completed_at && <CustomTag color={'green'}>Completado</CustomTag>}
                <div className="content">
                  {activity.comment}
                  <small>{dayjs(activity.expired_at).fromNow()}</small>
                </div>
                <div className="tools">
                  <Image.PreviewGroup>
                    {activity.attachments?.map((at: ApiFile) => (
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
                              <FileIcon file={at} size={25}/>
                            </a>
                          </Tooltip>
                        )}
                      </>
                    ))}
                  </Image.PreviewGroup>
                  <div>
                    <Popconfirm
                      onConfirm={() => completeTask(activity.uuid, !!activity.completed_at)}
                      title={activity.completed_at ? 'Marcar tarea como no resuelta' : 'Vas a marcar esta tarea como completada'}
                      description={
                        activity.completed_at ? 'Se reactivarán las alertas para esta tarea' : 'No se emitirán nuevas alertas'
                      }>
                      <Tooltip
                        title={activity.completed_at ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
                        placement={'bottom'}>
                        <IconButton icon={activity.completed_at ? <PiProhibit size={17}/> : <PiCheckBold size={17}/>}/>
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>
                <div className="user">
                  {activity.assigned_to && <Avatar src={activity.assigned_to.avatar?.thumbnail}>
                    {activity.assigned_to.name.substring(0, 1)}
                  </Avatar> }
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="board-list">
          <div className="title"><CustomTag>0</CustomTag> En proceso</div>
        </div>
        <div className="board-list">
          <div className="title"><CustomTag>0</CustomTag> Completadas</div>
        </div>
      </div>
      </DndProvider>
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
      <EntityActivityCardViewer
        entityActivityUUID={selectedActivity?.uuid}
        onCancel={() => {
          setSelectedActivity(undefined);
          setOpenActivityEditor(false);
        }}
        open={openActivityEditor} />
    </ModuleContent>
  );
};

export default MyComponent;
