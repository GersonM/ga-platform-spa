import React, {useEffect, useState} from 'react';
import {Select, Space} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';

import type {Wallet} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CustomTag from "../../../CommonUI/CustomTag";

interface WalletSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  style?: React.CSSProperties;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

export const WalletSelector = ({placeholder, mode, style, ...props}: WalletSelectorProps) => {
  const [wallets, setWallets] = useState<Wallet | any>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const lastSearchText = useDebounce(name, 300);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: lastSearchText,
      },
    };

    axios
      .get(`/payment-management/wallets`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setWallets(
            response.data.map((item: Wallet) => {
              return {
                value: item.uuid,
                label: <Space>
                  <CustomTag color={'green'}>{item.bank_name.toUpperCase()} | {item.currency}</CustomTag>{item.name}  -<code>{item.account_number}</code>
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
  }, [lastSearchText]);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige cuenta'}
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


