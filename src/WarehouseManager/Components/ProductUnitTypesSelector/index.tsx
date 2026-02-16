import React, {useEffect, useState} from 'react';
import {AutoComplete} from "antd";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface ProductUnitTypesSelector {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
}

const ProductUnitTypesSelector = ({placeholder, ...props}: ProductUnitTypesSelector) => {
  const [groups, setGroups] = useState<string[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`warehouses/products/list-values/unit_type`, config)
      .then(response => {
        if (response) {
          setGroups(
            response.data.map((item?: string) => ({
              value: item || 'none',
              label: item || 'Sin tipo',
            })),
          );
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <AutoComplete
      {...props}
      allowClear
      placeholder={placeholder || 'Unidad'}
      showSearch={{
        optionFilterProp:'label'
      }}
      style={{minWidth: 120}}
      options={groups}
    />
  );
};

export default ProductUnitTypesSelector;
