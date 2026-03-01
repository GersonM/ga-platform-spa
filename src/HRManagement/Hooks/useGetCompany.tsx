import {useState} from 'react';
import axios from 'axios';

import type {Company} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';

const useGetCompany = (onComplete?: (company: Company) => void) => {
  const [company, setCompany] = useState<Company>();
  const [loading, setLoading] = useState(false);

  const getCompany = async (companyUuid: string) => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    try {
      const response = await axios.get(`hr-management/companies/${companyUuid}`, config);
      if (response) {
        setCompany(response.data);
        if (onComplete) {
          onComplete(response.data);
        }
      }
      setLoading(false);
      return response.data;
    } catch (error) {
      ErrorHandler.showNotification(error);
      setLoading(false);
    }

    return cancelTokenSource.cancel;
  };

  return {company, getCompany, loading};
};

export default useGetCompany;
