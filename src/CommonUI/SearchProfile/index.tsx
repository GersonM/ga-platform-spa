import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Select} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';

import {Profile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';

interface SearchProfileProps {
  style?: React.CSSProperties;
  mode?: 'multiple' | 'tags';
  onChange?: (values: any) => void;
  value?: string | string[];
}

const SearchProfile = ({style, value, onChange, mode}: SearchProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [searchProfile, setSearchProfile] = useState<string>();
  const lastSearchText = useDebounce(searchProfile, 400);
  const [profiles, setProfiles] = useState<Profile[]>();

  useEffect(() => {
    if (lastSearchText) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
        params: {search: lastSearchText},
      };

      setLoading(true);
      axios
        .get('hr-management/profiles', config)
        .then(response => {
          setLoading(false);
          setProfiles(response.data.data);
        })
        .catch(error => {
          setLoading(false);
          ErrorHandler.showNotification(error);
        });

      return cancelTokenSource.cancel;
    }
  }, [lastSearchText]);
  return (
    <Select
      loading={loading}
      mode={mode}
      value={value}
      onChange={onChange}
      allowClear
      filterOption={false}
      style={{width: '100%', ...style}}
      showSearch
      options={profiles?.map(profile => ({value: profile.uuid, label: profile.name}))}
      placeholder="Busca una persona"
      onSearch={value => {
        setSearchProfile(value);
      }}
    />
  );
};

export default SearchProfile;
