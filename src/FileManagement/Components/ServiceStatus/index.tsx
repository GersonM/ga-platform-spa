import {useEffect, useState} from 'react';
import axios from 'axios';

import './styles.less';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import type {FileManagementStatus} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileSize from '../../../CommonUI/FileSize';

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
      <LoadingIndicator visible={loading} />
      <span onClick={() => setReload(!reload)} className="icon icon-pie-chart"></span>
      <div>
        <small>Espacio utilizado</small>
        {serviceStatus && (
          <>
            <FileSize size={serviceStatus.usage} /> ({((serviceStatus.usage / serviceStatus.total) * 100).toFixed(2)}%)
          </>
        )}
      </div>
      <div>
        <small>Total</small>
        {serviceStatus && <FileSize size={serviceStatus.total} />}
      </div>
    </div>
  );
};

export default ServiceStatus;
