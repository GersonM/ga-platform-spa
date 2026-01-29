import React, {useEffect, useState} from 'react';
import {Select, Space} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';

import type {Wallet, WalletTransaction} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CustomTag from "../../../CommonUI/CustomTag";
import MoneyString from "../../../CommonUI/MoneyString";

interface WalletTransactionSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  style?: React.CSSProperties;
  size?: 'small' | 'large';
  currency?: string;
  refresh?: boolean;
  mode?: 'multiple' | 'tags' | undefined;
}

export const WalletTransactionSelector = ({refresh, placeholder, mode, style, currency, ...props}: WalletTransactionSelectorProps) => {
  const [wallets, setWallets] = useState<Wallet | any>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>();
  const lastSearchText = useDebounce(name, 300);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: lastSearchText,
        //currency: currency,
      },
    };

    axios
      .get(`/payment-management/transactions`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setWallets(
            response.data.data.map((item: WalletTransaction) => {
              const currency = item.wallet_from?.currency ?? item.wallet_to?.currency;
              return {
                value: item.uuid,
                entity: item,
                label: <Space>
                  <CustomTag color={item.type=='deposit'?'green':'orange'}><MoneyString currency={currency} value={item.amount}/></CustomTag>{item.tracking_id}  -<code>{item.payment_channel}</code>
                </Space>
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
  }, [lastSearchText, refresh]);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige transacción'}
      showSearch={true}
      onSearch={value => setName(value)}
      filterOption={false}
      loading={loading}
      onClear={() => {
        setName('');
      }}
      style={style ? style : {width: '100%'}}
      options={wallets}
      popupMatchSelectWidth={false}
    />
  );
};


