import {useEffect, useState} from 'react';
import axios from 'axios';

import type {Role} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';

const useGetRoles = (onComplete?: (roles: Role[]) => void) => {
  const [roles, setRoles] = useState<Role[]>();
  const [loading, setLoading] = useState(false);

  const getRoles = async () => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    try {
      const response = await axios.get('authentication/roles', config);
      if (response) {
        setRoles(response.data);
        if (onComplete) {
          onComplete(response.data);
        }
      }
    } catch (error) {
      ErrorHandler.showNotification(error);
    } finally {
      setLoading(false);
    }

    return cancelTokenSource.cancel;
  };

  useEffect(() => {
    getRoles().then();
  }, []);

  return {roles, loading, getRoles};
};

export default useGetRoles;
