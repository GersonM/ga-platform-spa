import {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Button} from 'antd';

const MailAccountStats = () => {
  const [_stats, setStats] = useState();
  const params = useParams();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`inbox-management/accounts/${params.uuid}_stats`, config)
      .then(response => {
        if (response) {
          setStats(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  return (
    <div>
      _stats
      <Button onClick={() => setReload(!reload)}>Recargar</Button>
    </div>
  );
};

export default MailAccountStats;
