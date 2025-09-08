import React, {useEffect, useState} from 'react';
import {AutoComplete} from "antd";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface ProductGroupsSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
}

const ProductGroupsSelector = ({placeholder, ...props}: ProductGroupsSelectorProps) => {
  const [groups, setGroups] = useState<string[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`warehouses/products/list-values/group`, config)
      .then(response => {
        if (response) {
          setGroups(
            response.data.map((item?: string) => ({
              value: item || 'none',
              label: item || 'Sin grupo',
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
      popupMatchSelectWidth={false}
      allowClear
      placeholder={placeholder || 'Elige un grupo'}
      showSearch={true}
      style={{minWidth: 120}}
      optionFilterProp={'label'}
      options={groups}
    />
  );
};

export default ProductGroupsSelector;
