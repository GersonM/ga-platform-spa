import axios from "axios";
import {useState} from 'react';
import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import type {StorageWarehouse} from "../../Types/api.tsx";

const useGetWarehouse = (onComplete?: (warehouse: StorageWarehouse) => void) => {
  const [loading, setLoading] = useState(false);

  const getWarehouse = async (warehouseUuid: string) => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    try {
      const response = await axios.get(`warehouses/${warehouseUuid}`, config);
      if (response) {
        if (onComplete) onComplete(response.data);
      }
      setLoading(false);
      return response.data;
    } catch (error) {
      ErrorHandler.showNotification(error);
      setLoading(false);
    }

    return cancelTokenSource.cancel;
  };

  return {getWarehouse, loading};
};

export default useGetWarehouse;
