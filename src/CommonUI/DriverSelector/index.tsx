import {useEffect, useState} from 'react';
import {Select} from 'antd';
import axios from 'axios';
import type {MoveDriver} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';

interface DriverSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  style?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const DriverSelector = ({placeholder, mode, ...props}: DriverSelectorProps) => {
  const [users, setUsers] = useState<MoveDriver | any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/drivers`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setUsers(
            response.data.map((item: MoveDriver) => {
              return {
                value: item.uuid,
                entity: item,
                label: `${item.profile?.name} ${item.profile?.last_name}`,
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
  }, []);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige un persona'}
      showSearch={true}
      optionFilterProp={'label'}
      loading={loading}
      options={users}
      mode={mode || undefined}
    />
  );
};

export default DriverSelector;
