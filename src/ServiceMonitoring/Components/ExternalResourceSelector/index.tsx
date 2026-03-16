import {type CSSProperties, useEffect, useState} from 'react';
import {Select} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';
import type {ExternalResource} from '../../../Types/api.tsx';
import ErrorHandler from '../../../Utils/ErrorHandler.tsx';

interface ExternalResourceSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  onClear?: () => void;
  value?: any;
  style?: CSSProperties;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ExternalResourceSelector = ({placeholder, mode, style, ...props}: ExternalResourceSelectorProps) => {
  const [resources, setResources] = useState<ExternalResource[]>();
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
      .get(`external-resources`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          const data = response.data?.data ?? response.data ?? [];
          setResources(
            data.map((item: ExternalResource) => {
              return {value: item.uuid, label: `${item.name}`, resource: item};
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
      placeholder={placeholder || 'Selecciona un recurso'}
      showSearch={{
        onSearch: value => setName(value),
        optionFilterProp: 'label'
      }}
      loading={loading}
      style={style ? style : {width: '100%'}}
      options={resources}
      mode={mode}
      optionRender={option => {
        return (
          <div>
            {option.label}
            <br/>
            {/* @ts-ignore */}
            <small>{option?.data.resource?.description || option?.data.resource?.type}</small>
          </div>
        );
      }}
    />
  );
};

export default ExternalResourceSelector;
