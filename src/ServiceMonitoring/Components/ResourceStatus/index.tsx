import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Tooltip} from "antd";

import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import CustomTag from "../../../CommonUI/CustomTag";

interface ResourceStatusProps {
  resourceUuid?: string;
  autoRefresh?: boolean;
}

const ResourceStatus = ({resourceUuid, autoRefresh = false}: ResourceStatusProps) => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [status, setStatus] = useState<any>();
  const [force, setForce] = useState(false);
  const [time, setTime] = useState<any>();

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => setTime(Date.now()), 20000);
      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    if (!resourceUuid) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {force: force ? 1 : null},
    };

    setLoading(true);
    console.log('updating')

    axios
      .get(`external-resources/${resourceUuid}/status`, config)
      .then(response => {
        if (response) {
          setStatus(response.data);
          setForce(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, time]);

  return (
    <div className={'resource-status-container'} onClick={() => {
      setForce(true);
      setReload(!reload);
    }}>
      <LoadingIndicator visible={loading}/>
      <Tooltip title={status?.server?.uptime + ` (${status?.server?.users} usuarios)`} placement={'top'}>
        <CustomTag color={status?.status == 'active' ? 'green' : 'red'}>
          {status?.status == 'active' ? 'Activo' : 'Error'} {' '}
          ({status?.server?.load_percentage.toFixed(1)}%)
        </CustomTag>
      </Tooltip>
    </div>
  );
};

export default ResourceStatus;
