import axios from "axios";
import React, {useEffect, useState} from 'react';

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
        .catch(() => {
          setLoading(false);
        });

      return cancelTokenSource.cancel;
    }, [reload]);
  return (
    <div>

    </div>
  );
};

export default SystemInsights;
