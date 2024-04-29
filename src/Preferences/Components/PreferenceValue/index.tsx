import React, {useEffect, useState} from 'react';
import {ColorPicker, Input, Space} from 'antd';

import {SettingValue} from '../../../Types/api';
import './styles.less';
import IconButton from '../../../CommonUI/IconButton';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {TrashIcon} from '@heroicons/react/24/outline';

interface PreferenceValueProps {
  preference: SettingValue;
  onUpdated?: () => void;
}

const PreferenceValue = ({preference, onUpdated}: PreferenceValueProps) => {
  const [value, setValue] = useState(preference.value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(preference.value);
  }, [preference]);

  const getControl = () => {
    switch (preference.type) {
      case 'color':
        return <ColorPicker value={value} onChange={value => onChangeValue(value.toHexString())} />;
      default:
        return <Input placeholder={'Value'} value={value} onChange={e => onChangeValue(e.target.value)} />;
    }
  };

  const onChangeValue = (val: string) => {
    setValue(val);
  };

  const saveValue = () => {
    setLoading(true);
    axios
      .put('/tenant-management/settings', {value, key: preference.key})
      .then(() => {
        setLoading(false);
        onUpdated && onUpdated();
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const deleteValue = () => {
    setLoading(true);
    axios
      .delete('/tenant-management/settings/' + preference.key)
      .then(() => {
        setLoading(false);
        onUpdated && onUpdated();
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div className={'preference-value-container'}>
      <span className={'label'}>{preference.label}</span>
      <Space>
        {getControl()}
        <IconButton small loading={loading} icon={<CheckIcon />} onClick={saveValue} />
        <IconButton small danger loading={loading} icon={<TrashIcon />} onClick={deleteValue} />
      </Space>
    </div>
  );
};

export default PreferenceValue;
