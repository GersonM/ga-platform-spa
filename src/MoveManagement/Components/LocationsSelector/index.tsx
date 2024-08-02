import {useEffect, useState} from 'react';
import {Select} from 'antd';
import axios from 'axios';
import {Profile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';

interface ProfileSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ProfileSelector = ({placeholder, mode, ...props}: ProfileSelectorProps) => {
  const [users, setUsers] = useState<Profile | any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`hr-management/profiles`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setUsers(
            response.data.data.map((item: Profile) => {
              return {value: item.uuid, label: `${item.name} ${item.last_name}`};
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

export default ProfileSelector;
