import axios from "axios";
import {useEffect, useState} from 'react';
import {Descriptions} from 'antd';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ErrorHandler from '../../../Utils/ErrorHandler';

const SystemInsights = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`workspaces/system-insights`, config)
      .then(response => {
        if (response) {
          setData(response.data);
        }
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div style={{position: 'relative'}}>
      <LoadingIndicator visible={loading} overlay/>
      {data && (
        <Descriptions bordered size={'small'} column={2}>
          {Object.entries(data).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              {renderValue(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </div>
  );
};

export default SystemInsights;
