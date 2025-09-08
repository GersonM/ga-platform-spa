import {useEffect, useState} from 'react';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';
import {Divider, Select, Tag} from 'antd';
import pluralize from 'pluralize';

import type {StorageStock} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';

interface ProductSelectorProps {
  placeholder?: string;
  currency?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const StockSelector = ({placeholder, currency, mode, refresh, ...props}: ProductSelectorProps) => {
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
            response.data
              .data
              .filter((item: StorageStock) => !currency || item.currency === currency)
              .map((item: StorageStock) => {
              let disabled = item.status != 'available';
              if(currency != null) {
                disabled = currency != item.currency
              }
              return {
                value: item.uuid,
                entity: item,
                disabled,
                title: item.status,
                label: (
                  <>
                    <Tag bordered={false} color={'blue'}>{item.sku}</Tag>
                    <MoneyString currency={item.currency} value={item.sale_price}/> - {item?.variation_name || item?.product?.name}
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
  }, [refresh, lastSearchText, currency]);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige un producto'}
      showSearch={true}
      popupMatchSelectWidth={false}
      filterOption={false}
      loading={loading}
      options={stock}
      optionRender={option => {
        // @ts-ignore
        const stock: StorageStock = option.data.entity;
        const units = stock.is_consumable ? pluralize(stock.product?.unit_type || 'unit', stock.quantity, true) : 'Ilimitado';
        return <div>
          <code style={{fontSize:13}}>{stock.sku}</code> <Divider type={'vertical'} /> <MoneyString currency={stock.currency} value={stock.sale_price}/> <Tag bordered={false} color={stock.is_consumable ? 'orange' : 'purple'}>{units}</Tag>
          <small>{stock?.variation_name || stock?.product?.name}</small>
        </div>;
      }}
      mode={mode || undefined}
      onSearch={value => setStockSearch(value)}
    />
  );
};

export default StockSelector;
