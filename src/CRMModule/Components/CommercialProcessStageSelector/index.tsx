import {useEffect, useState} from "react";
import {Select} from "antd";
import type {SelectProps} from "antd";
import axios from "axios";

import type {CommercialProcess,} from "../../../Types/api.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface CommercialProcessStageSelectorProps extends Omit<SelectProps, "mode" | "options"> {
  refresh?: boolean;
}

const CommercialProcessStageSelector = ({refresh, placeholder, ...props}: CommercialProcessStageSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Array<{ label: string; options: Array<{ value: string; label: string }>}>>([]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token,};

    setLoading(true);
    axios
      .get("commercial/processes", config)
      .then(response => {
        if (response) {
          const groupedOptions = response.data.map((process: CommercialProcess) => ({
            label: process.name,
            options: process.stages.map(stage => ({
              value: stage.uuid,
              label: stage.name,
            })),
          }));
          setOptions(groupedOptions);
        }
        setLoading(false);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
        setLoading(false);
      })

    return cancelTokenSource.cancel;
  }, [refresh]);

  return (
    <Select
      {...props}
      value={props.value}
      allowClear
      showSearch={{
        optionFilterProp: 'label'
      }}
      placeholder={placeholder || "Selecciona una etapa"}
      loading={loading}
      options={options}
    />
  );
};

export default CommercialProcessStageSelector;
