import {useState, useEffect} from 'react';
import axios from 'axios';
import ErrorHandler from './ErrorHandler';

interface UseGetReturn<T> {
  data: T;
  loading: boolean;
  error: any;
  refetch: () => void;
}

export const useGet = <T,>(url: string, params?: any, onComplete?: (data?: T) => void): UseGetReturn<T> => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getData = async () => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params,
    };

    setLoading(true);
    axios
      .get(url, config)
      .then(response => {
        if (response) {
          if (onComplete) {
            onComplete();
          }
          setData(response?.data?.data);
        }
      })
      .catch(error => {
        setError(true);
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setLoading(false);
      });
    return cancelTokenSource.cancel;
  };
  useEffect(() => {
    if (url) {
      getData();
    }

    // eslint-disable-next-line
  }, [url]);

  return {data, loading, error, refetch: getData};
};
