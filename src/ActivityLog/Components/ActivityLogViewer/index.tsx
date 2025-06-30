import React, {useEffect, useState} from 'react';
import axios from "axios";
import {TbChevronDown, TbChevronUp, TbReload, TbTerminal2} from "react-icons/tb";
import {Button, Divider, Flex, Pagination, Popover, Space, Tag} from "antd";
import dayjs from "dayjs";

import type {ResponsePagination} from "../../../Types/api.tsx";
import IconButton from "../../../CommonUI/IconButton";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import Config from "../../../Config.tsx";
import './styles.less';

interface ActivityLogViewerProps {
  entity?: string;
  id?: string;
}

const ActivityLogViewer = ({entity, id}: ActivityLogViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<any[]>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>()

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        page: currentPage,
        type: entity,
        id
      },
    };

    setLoading(true);

    axios
      .get(`activity-log`, config)
      .then(response => {
        if (response) {
          setActivity(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, currentPage]);

  const actions: any = {
    created: 'creado',
    updated: 'modificado',
    deleted: 'borrado',
  }

  const colors: any = {
    created: 'green',
    updated: 'orange',
    deleted: 'red',
  }

  return (
    <div className="activity-log-viewer-container">
      <Flex align={'center'} justify="space-between">
        Actividad
        <Space>
          <IconButton small icon={<TbReload/>} onClick={() => setReload(!reload)}/>
          <Button size={'small'} onClick={() => setOpen(!open)} variant={'link'} type={'text'}>
            {open ? 'Ocultar' : 'Ver'} {pagination?.total} items
            {open ? <TbChevronUp/> : <TbChevronDown/>}
          </Button>
        </Space>
      </Flex>
      {open && <>
        <Divider size={"small"}/>
        <LoadingIndicator visible={loading}/>
        {activity?.map((item, index: number) => {
          const entityType = item.subject_type.split('\\').reverse()[0];
          return <Popover key={index} content={<div>
            <h3>{entityType} {dayjs(item.created_at).format(Config.datetimeFormatUser)}</h3>
            <small>User UUID: {item.causer?.uuid}</small>
            {item?.properties?.attributes && <>
              <strong>Valores modificados:</strong> <br/>
              <pre style={{fontSize: 12}}>
                {JSON.stringify(item?.properties?.attributes, null, 2)}
              </pre>
            </>}
            {item?.properties?.old && <>
              <strong>Anteriores:</strong> <br/>
              <pre style={{fontSize: 12}}>
                  {JSON.stringify(item?.properties?.old, null, 2)}
                </pre>
            </>}
          </div>}>
            <div className={'log-item'}>
              <span>
              {entityType} <strong
                style={{color: colors[item.event]}}>{actions[item.event]}</strong> por <strong>{item.causer?.name || 'Nadie'}</strong>
              </span>
              {dayjs(item.created_at).fromNow()}
            </div>
          </Popover>;
        })}
        {pagination &&
          <Pagination
            align={"center"}
            onChange={(page) => setCurrentPage(page)}
            size={"small"}
            pageSize={pagination?.per_page} total={pagination?.total}
            current={pagination.current_page}/>
        }
      </>}

    </div>
  );
};

export default ActivityLogViewer;
