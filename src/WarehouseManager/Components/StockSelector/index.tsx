import {useEffect, useState} from 'react';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';
import {Select, Tag} from 'antd';

import type {StorageStock} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
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

const StockSelector = ({placeholder, mode, refresh, ...props}: ProductSelectorProps) => {
  const [stock, setStock] = useState<StorageStock[]>([]);
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
          setStock(
            response.data.data.map((item: StorageStock) => {
              const units = item.is_consumable ? item.quantity +' '+ item.product?.unit_type : 'Ilimitado';
              return {
                value: item.uuid,
                entity: item,
                label: (
                  <>
                    {item.sku} - <MoneyString currency={item.currency} value={item.sale_price} /> <Tag bordered={false} color={item.is_consumable ? 'orange':'purple'}>{units}</Tag>
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
      placeholder={placeholder || 'Elige un producto'}
      showSearch={true}
      filterOption={false}
      loading={loading}
      options={stock}
      mode={mode || undefined}
      onSearch={value => setStockSearch(value)}
      optionRender={item => {
        return <>
          {item.label} <br/>
          {/* @ts-ignore */}
          <small>{item.data.entity?.product?.name}</small>
        </>
      }}
    />
  );
};

export default StockSelector;
