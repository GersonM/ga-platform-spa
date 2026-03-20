import {Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Avatar, Image, Popconfirm, Progress, Space, Tooltip} from 'antd';
import {PiCheckBold, PiProhibit} from 'react-icons/pi';
import dayjs from 'dayjs';
import {TbCalendarClock, TbCalendarSad} from "react-icons/tb";
import axios from 'axios';
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider, useDrag, useDrop} from 'react-dnd'

import type {EntityActivity, ApiFile, ResponsePagination} from '../../../Types/api';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileIcon from '../../../FileManagement/Components/FileIcon';
import AuthContext from '../../../Context/AuthContext';
import CustomTag from "../../../CommonUI/CustomTag";
import EntityActivityCardViewer from "../../Components/EntityActivityCardViewer";
import InfoButton from "../../../CommonUI/InfoButton";
import TablePagination from "../../../CommonUI/TablePagination";
import './styles.less';

const DRAG_TYPE_ACTIVITY = 'activity-card';
type BoardStatus = 'pending' | 'in-progress' | 'completed';

const getActivityStatus = (activity: EntityActivity): BoardStatus => {
  if (activity.completed_at) return 'completed';
  if (activity.work_session_started_at) return 'in-progress';
  return 'pending';
};

const MyTasks = () => {
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
  const recentlyDroppedRef = useRef<{uuid?: string; at: number}>({at: 0});
  const {updateActivityCount, activityCount} = useContext(AuthContext);

  const pendingActivities = useMemo(
    () => activities?.filter(activity => !activity.completed_at && !activity.work_session_started_at) ?? [],
    [activities]
  );
  const inProgressActivities = useMemo(
    () => activities?.filter(activity => !activity.completed_at && !!activity.work_session_started_at) ?? [],
    [activities]
  );
  const completedActivities = useMemo(
    () => activities?.filter(activity => !!activity.completed_at) ?? [],
    [activities]
  );
  const activityByUUID = useMemo(
    () => new Map((activities ?? []).map(activity => [activity.uuid, activity])),
    [activities]
  );

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

  const completeTask = useCallback((uuid: string, resolve: boolean, options?: {skipReload?: boolean}) => {
    axios
      .post(resolve ? `entity-activity/${uuid}/pending` : `entity-activity/${uuid}/complete`, {})
      .then(_response => {
        if (!options?.skipReload) {
          setReload(prev => !prev);
        }
        if (updateActivityCount) {
          updateActivityCount();
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  }, [updateActivityCount]);

  const startWorkSession = useCallback((uuid: string, options?: {skipReload?: boolean}) => {
    axios
      .post(`entity-activity/${uuid}/start-work`, {})
      .then(_response => {
        if (!options?.skipReload) {
          setReload(prev => !prev);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  }, []);

  const stopWorkSession = useCallback((uuid: string, options?: {skipReload?: boolean}) => {
    axios
      .post(`entity-activity/${uuid}/stop-work`, {})
      .then(_response => {
        if (!options?.skipReload) {
          setReload(prev => !prev);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  }, []);

  const moveActivityTo = useCallback((activity: EntityActivity, targetStatus: BoardStatus) => {
    setActivities(prevActivities => {
      if (!prevActivities) return prevActivities;
      return prevActivities.map(item => {
        if (item.uuid !== activity.uuid) return item;
        if (targetStatus === 'completed') {
          return {
            ...item,
            completed_at: item.completed_at ?? new Date().toISOString(),
          };
        }
        if (targetStatus === 'in-progress') {
          return {
            ...item,
            completed_at: undefined,
            work_session_started_at: item.work_session_started_at ?? Date.now(),
          };
        }
        return {
          ...item,
          completed_at: undefined,
          work_session_started_at: undefined,
          work_started_at: undefined,
          work_accumulated_minutes: 0,
        };
      });
    });

    if (targetStatus === 'completed') {
      if (!activity.completed_at) completeTask(activity.uuid, false, {skipReload: true});
    } else {
      if (activity.completed_at) completeTask(activity.uuid, true, {skipReload: true});
    }

    if (targetStatus === 'in-progress' && !activity.work_session_started_at) {
      startWorkSession(activity.uuid, {skipReload: true});
    }

    if (targetStatus === 'pending' && activity.work_session_started_at) {
      stopWorkSession(activity.uuid, {skipReload: true});
    }
  }, [completeTask, startWorkSession, stopWorkSession]);

  const ActivityCard = ({activity}: {activity: EntityActivity}) => {
    const activityStatus = getActivityStatus(activity);
    const [{isDragging}, dragRef] = useDrag(
      () => ({
        type: DRAG_TYPE_ACTIVITY,
        item: {uuid: activity.uuid, status: activityStatus},
        end: (_item, monitor) => {
          if (monitor.didDrop()) {
            recentlyDroppedRef.current = {uuid: activity.uuid, at: Date.now()};
          }
        },
        collect: monitor => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [activity.uuid, activityStatus]
    );

    return (
      <div
        // @ts-ignore
        ref={dragRef}
        className={`activity-card ${isDragging ? 'dragging' : ''}`}
        style={{opacity: isDragging ? 0.5 : 1}}
        onClick={() => {
          const droppedRecently =
            recentlyDroppedRef.current.uuid === activity.uuid && Date.now() - recentlyDroppedRef.current.at < 220;
          if (droppedRecently) return;
          setSelectedActivity(activity);
          setOpenActivityEditor(true);
        }}>
        {activity.completed_at && <CustomTag color={'green'}>Completado</CustomTag>}
        <div className="content">
          {activity.comment}
          <small>Vence {dayjs(activity.expired_at).fromNow()}</small>
        </div>
        <div className="tools">
          <Image.PreviewGroup>
            {activity.attachments?.map((at: ApiFile) => (
              <Fragment key={at.uuid}>
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
              </Fragment>
            ))}
          </Image.PreviewGroup>
        </div>
        <Space>
          <Popconfirm
            onConfirm={() => completeTask(activity.uuid, !!activity.completed_at)}
            title={activity.completed_at ? 'Marcar tarea como no resuelta' : 'Vas a marcar esta tarea como completada'}
            description={
              activity.completed_at ? 'Se reactivarán las alertas para esta tarea' : 'No se emitirán nuevas alertas'
            }>
            <Tooltip
              title={activity.completed_at ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
              placement={'bottom'}>
              <IconButton
                icon={activity.completed_at ? <PiProhibit size={17}/> : <PiCheckBold size={17}/>}/>
            </Tooltip>
          </Popconfirm>
          <div className="user">
            {activity.assigned_to && <Avatar src={activity.assigned_to.avatar?.thumbnail}>
              {activity.assigned_to.name.substring(0, 1)}
            </Avatar>}
          </div>
          <CustomTag>{activity.work_accumulated_minutes}</CustomTag>
        </Space>
        <small>
          {activity.profile?.name} {dayjs(activity.created_at).fromNow()}
        </small>
      </div>
    );
  };

  const BoardColumn = ({
    status,
    title,
    items,
  }: {
    status: BoardStatus;
    title: string;
    items: EntityActivity[];
  }) => {
    const [{isOver, canDrop}, dropRef] = useDrop(
      () => ({
        accept: DRAG_TYPE_ACTIVITY,
        canDrop: (item: {uuid: string; status: BoardStatus}) => item.status !== status,
        drop: (item: {uuid: string; status: BoardStatus}) => {
          if (item.status === status) return;
          const activity = activityByUUID.get(item.uuid);
          if (!activity) return;
          moveActivityTo(activity, status);
        },
        collect: monitor => ({
          isOver: monitor.isOver({shallow: true}),
          canDrop: monitor.canDrop(),
        }),
      }),
      [activityByUUID, moveActivityTo, status]
    );

    return (
      <div
        // @ts-ignore
        ref={dropRef}
        className={`board-list ${status} ${isOver ? 'is-over' : ''} ${canDrop ? 'can-drop' : 'cant-drop'}`}>
        <div className="title"><CustomTag>{items.length}</CustomTag> {title}</div>
        <div className="items">
          {isOver && canDrop && <div className="drop-feedback valid">Suelta para mover la tarea</div>}
          {items.length === 0 && (
            <div className="empty-column-message">
              Arrastra tareas aquí
            </div>
          )}
          {items.map(activity => (
            <ActivityCard key={activity.uuid} activity={activity}/>
          ))}
        </div>
      </div>
    );
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
              size={38}
              percent={Math.round((activityCount?.completed * 100) / activityCount.total)}
            />
            <InfoButton icon={<TbCalendarClock/>} label={'Pendientes'} value={activityCount?.pending}/>
            <InfoButton icon={<TbCalendarSad/>} label={'Vencidas'} value={activityCount?.expired}/>
          </>
        )}
      />
      <DndProvider backend={HTML5Backend}>
        <div className={'activity-board'}>
          <BoardColumn status="pending" title="Pendientes" items={pendingActivities}/>
          <BoardColumn status="in-progress" title="En proceso" items={inProgressActivities}/>
          <BoardColumn status="completed" title="Completadas" items={completedActivities}/>
        </div>
      </DndProvider>
      <TablePagination
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
        pagination={pagination}
      />
      <EntityActivityCardViewer
        entityActivityUUID={selectedActivity?.uuid}
        onCancel={() => {
          setSelectedActivity(undefined);
          setOpenActivityEditor(false);
        }}
        open={openActivityEditor}/>
    </ModuleContent>
  );
};

export default MyTasks;
