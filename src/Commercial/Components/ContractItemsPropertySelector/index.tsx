import React, {useEffect, useState} from 'react';
import {AutoComplete} from "antd";
import axios from "axios";

interface ProductManufacturerSelectorProps {
  placeholder?: string;
  property?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
}

const ProductManufacturerSelector = ({placeholder, property, ...props}: ProductManufacturerSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [manufacturers, setManufacturers] = useState<string[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`commercial/contract-items/list-values/${property}`, config)
      .then(response => {
        if (response) {
          setManufacturers(
            response.data.map((item?: string) => ({
              value: item || 'none',
              label: item || 'Ninguno',
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
      placeholder={placeholder || 'Elige un valor'}
      showSearch={true}
      style={{minWidth: 120}}
      optionFilterProp={'label'}
      options={manufacturers}
    />
  );
};

export default ProductManufacturerSelector;
