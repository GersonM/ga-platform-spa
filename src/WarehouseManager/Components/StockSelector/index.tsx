import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Select} from 'antd';

import {Campaign} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {useDebounce} from '@uidotdev/usehooks';
import MoneyString from '../../../CommonUI/MoneyString';

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
  const [campaign, setCampaign] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState<string>();
  const lastSearchText = useDebounce(stockSearch, 400);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {search: lastSearchText},
    };

    axios
      .get(`warehouses/stock`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCampaign(
            response.data.data.map((item: any) => {
              return {
                value: item.uuid,
                entity: item,
                label: (
                  <>
                    {item.sku} - <MoneyString value={item.sale_price} />
                  </>
                ),
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
  }, [refresh, lastSearchText]);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige una producto'}
      showSearch={true}
      filterOption={false}
      loading={loading}
      options={campaign}
      mode={mode || undefined}
      onSearch={value => setStockSearch(value)}
    />
  );
};

export default ProductSelector;
