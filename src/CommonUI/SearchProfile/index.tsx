import {useEffect, useState} from 'react';
import axios from 'axios';
import {Select} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';

import type {Profile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';
import ProfileDocument from '../ProfileTools/ProfileDocument';

interface SearchProfileProps {
  style?: React.CSSProperties;
  mode?: 'multiple' | 'tags';
  size?: 'small' | 'large';
  onChange?: (values: any, item: any) => void;
  value?: string | string[];
  placeholder?: string;
  exclude_type?: string;
  filter_type?: string;
}

const SearchProfile = ({style, value, filter_type, exclude_type, mode, ...props}: SearchProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [searchProfile, setSearchProfile] = useState<string>();
  const lastSearchText = useDebounce(searchProfile, 400);
  const [profiles, setProfiles] = useState<any[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {search: lastSearchText, exclude_type, filter_type},
    };

    setLoading(true);
    axios
      .get('hr-management/profiles', config)
      .then(response => {
        setLoading(false);
        if (response) {
          setProfiles(
            response.data.data.map((item: Profile) => {
              return {value: item.uuid, label: `${item.name} ${item.last_name}`, entity: item};
            }),
          );
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });

    return cancelTokenSource.cancel;
  }, [lastSearchText]);

  return (
    <Select
      loading={loading}
      mode={mode}
      popupMatchSelectWidth={false}
      value={value}
      allowClear
      filterOption={false}
      style={{width: '100%', ...style}}
      showSearch
      options={profiles}
      placeholder="Buscar una persona"
      optionRender={(option: any) => {
        return (
          <div>
            {option?.label}
            <br />
            <small>
              <ProfileDocument profile={option.data.entity} />| {option.data.entity.email}
            </small>
          </div>
        );
      }}
      onSearch={value => {
        setSearchProfile(value);
      }}
      {...props}
    />
  );
};

export default SearchProfile;
