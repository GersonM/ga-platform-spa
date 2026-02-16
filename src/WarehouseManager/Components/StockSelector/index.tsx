import {useEffect, useState} from 'react';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';
import {Divider, Select, Tag} from 'antd';
import pluralize from 'pluralize';

import type {StorageProduct, StorageProductVariation, StorageStock} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';

interface ProductSelectorProps {
  placeholder?: string;
  currency?: string;
  product?: StorageProduct;
  variation?: StorageProductVariation;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  open?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
  status?: 'sold' | 'available' | 'reserved' | 'all';
  mode?: 'multiple' | 'tags' | undefined;
}

const StockSelector = ({placeholder, currency, mode, refresh, product, status = 'available', variation, ...props}: ProductSelectorProps) => {
  const [stock, setStock] = useState<StorageStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState<string>();
  const lastSearchText = useDebounce(stockSearch, 400);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        page:1,
        search: lastSearchText,
        product_uuid: product?.uuid,
        variation_uuid: variation?.uuid,
        status: status
      },
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
              let disabled = status && item.status != status && status != 'all';
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
                    <Tag bordered={false} color={'blue'}>{item.serial_number}</Tag>
                    <MoneyString currency={item.currency} value={item.sale_price}/> - {item?.variation?.name || item?.variation?.product?.name}
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
        const units = stock.is_consumable ? pluralize(stock.variation?.product?.unit_type || 'unit', stock.quantity, true) : 'Ilimitado';
        return <div>
          <code style={{fontSize:13}}>{stock?.variation?.product?.name} {stock?.variation?.name}</code> <Divider orientation={'vertical'} /> <MoneyString currency={stock.currency} value={stock.sale_price}/> <Tag bordered={false} color={stock.is_consumable ? 'orange' : 'purple'}>{units}</Tag>
          <small><code>{stock.serial_number} | {stock.variation?.sku}</code></small>
        </div>;
      }}
      mode={mode || undefined}
      onSearch={value => setStockSearch(value)}
    />
  );
};

export default StockSelector;
