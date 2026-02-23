import axios from "axios";
import {useState} from 'react';
import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import {sileo} from "sileo";

const useContractRenew = (onComplete?: () => void) => {
  const [loading, setLoading] = useState(false);

  const renewContract = (contractUuid:string) => {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      setLoading(true);

      axios
        .post(`commercial/contracts/${contractUuid}/renew`, config)
        .then(response => {
          sileo.success({title:'El contrato se ha renovado correctamente.'});
          if (response) {
            if(onComplete) onComplete();
          }
          setLoading(false);
        })
        .catch((error) => {
          ErrorHandler.showNotification(error);
          setLoading(false);
        });

      return cancelTokenSource.cancel;
    };

  return {renewContract, loading};
};

export default useContractRenew;
