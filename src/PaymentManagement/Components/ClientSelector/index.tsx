import React, {useEffect, useState} from 'react';
import {Select} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';

import type {Client} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import CompanyChip from "../../../HRManagement/Components/CompanyChip";

interface ClientSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  style?: React.CSSProperties;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

export const ClientSelector = ({placeholder, mode, style, ...props}: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client | any>([]);
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
        short_list: 1,
        page: 1
      },
    };

    axios
      .get(`/commercial/clients`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setClients(
            response.data.data.map((item: Client) => {
              return {value: item.uuid, label: `${item.entity.name}`, entity: item};
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
      placeholder={placeholder || 'Buscar cliente'}
      showSearch={true}
      onSearch={value => setName(value)}
      filterOption={false}
      loading={loading}
      onClear={() => {
        setName('');
      }}
      style={style ? style : {width: '100%'}}
      options={clients}
      popupMatchSelectWidth={false}
      mode={mode}
      optionRender={option => (
          option.data.entity.type.includes('Profile') ? <ProfileChip profile={option.data.entity.entity}/> :
            <CompanyChip company={option.data.entity.entity}/>
      )}
    />
  );
};


