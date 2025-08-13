import {useEffect, useState} from 'react';
import axios from 'axios';
import {TbChartPie} from "react-icons/tb";

import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import type {FileManagementStatus} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileSize from '../../../CommonUI/FileSize';
import './styles.less';

const ServiceStatus = () => {
  const [serviceStatus, setServiceStatus] = useState<FileManagementStatus>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`file-management/status`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setServiceStatus(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  return (
    <div className={'service-usage-wrapper'}>
      <LoadingIndicator visible={loading} overlay/>
      <TbChartPie size={28} onClick={() => setReload(!reload)}/>
      {serviceStatus && (
        <div>
          <div>{((serviceStatus.usage / serviceStatus.total) * 100).toFixed(1)} % de uso</div>
          <code>
            <small>
              <FileSize size={serviceStatus.usage}/> de <FileSize size={serviceStatus.total}/>
            </small>
          </code>
        </div>
      )}
    </div>
  );
};

export default ServiceStatus;
