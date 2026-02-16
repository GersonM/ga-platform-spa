import React, {useEffect, useState} from 'react';
import {AutoComplete} from "antd";
import axios from "axios";

interface ProductBrandSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
}

const ProductBrandSelector = ({placeholder, ...props}:ProductBrandSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<string[]>();

  useEffect(() => {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      setLoading(true);

      axios
        .get(`warehouses/products/list-values/brand`, config)
        .then(response => {
          if (response) {
            setBrands(
              response.data.map((item?: string) => ({
                value: item || 'none',
                label: item || 'Sin marca',
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
      style={{ minWidth: 120 }}
      popupMatchSelectWidth={false}
      placeholder={placeholder || 'Elige una marca'}
      showSearch={{
        optionFilterProp:'label'
      }}
      filterOption={(inputValue, option) =>
        option!.value?.toUpperCase().indexOf(inputValue?.toUpperCase()) !== -1
      }
      options={brands}
    />
  );
};

export default ProductBrandSelector;
