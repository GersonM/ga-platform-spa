import React, {useEffect, useState} from 'react';
import {AutoComplete} from "antd";
import axios from "axios";

interface ProductManufacturerSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
}

const ProductManufacturerSelector = ({placeholder, ...props}:ProductManufacturerSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [manufacturers, setManufacturers] = useState<string[]>();

  useEffect(() => {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      setLoading(true);

      axios
        .get(`warehouses/products/list-values/manufacturer`, config)
        .then(response => {
          if (response) {
            setManufacturers(
              response.data.map((item?: string) => ({
                value: item || 'none',
                label: item || 'Sin fabricante',
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
      placeholder={placeholder || 'Elige un fabricante o proveedor'}
      showSearch={{
        optionFilterProp:'label'
      }}
      style={{ minWidth: 120 }}
      options={manufacturers}
    />
  );
};

export default ProductManufacturerSelector;
