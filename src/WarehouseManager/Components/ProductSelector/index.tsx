import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Select} from 'antd';

import {Campaign} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface ProductSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ProductSelector = ({placeholder, mode, refresh, ...props}: ProductSelectorProps) => {
  const [campaign, setCampaign] = useState<Campaign | any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`warehouse/products`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCampaign(
            response.data.map((item: Campaign) => {
              return {
                value: item.uuid,
                entity: item,
                label: `${item.name}`,
              };
            }),
          );
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [refresh]);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige una producto'}
      showSearch={true}
      optionFilterProp={'label'}
      loading={loading}
      options={campaign}
      mode={mode || undefined}
    />
  );
};

export default ProductSelector;
