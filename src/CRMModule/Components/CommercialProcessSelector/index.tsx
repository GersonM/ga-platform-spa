import {useEffect, useState} from "react";
import {Select} from "antd";
import type {SelectProps} from "antd";
import axios from "axios";

import type {CommercialProcess} from "../../../Types/api.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface CommercialProcessSelectorProps extends SelectProps {
  refresh?: boolean;
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const CommercialProcessSelector = ({refresh, placeholder, ...props}: CommercialProcessSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Array<{ value: string; label: string; entity: CommercialProcess }>>([]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get<{ data?: CommercialProcess[] } | CommercialProcess[]>("commercial/processes", config)
      .then(response => {
        const payload = response.data;
        const processes = isArray(payload) ? payload : isArray(payload?.data) ? payload.data : [];

        setOptions(
          (processes as CommercialProcess[]).map(process => ({
            value: process.uuid,
            label: process.name,
            entity: process,
          }))
        );
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [refresh]);

  return (
    <Select
      {...props}
      allowClear
      showSearch={{
        optionFilterProp: 'label'
      }}
      placeholder={placeholder || 'Selecciona un proceso'}
      loading={loading}
      options={options}
    />
  );
};

export default CommercialProcessSelector;
