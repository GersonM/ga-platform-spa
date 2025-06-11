import React, {useEffect, useState} from 'react';
import {AutoComplete} from "antd";
import axios from "axios";

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
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<string[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

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
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <AutoComplete
      {...props}
      allowClear
      placeholder={placeholder || 'Elige un grupo'}
      showSearch={true}
      style={{ minWidth: 120 }}
      optionFilterProp={'label'}
      options={groups}
    />
  );
};

export default ProductGroupsSelector;
