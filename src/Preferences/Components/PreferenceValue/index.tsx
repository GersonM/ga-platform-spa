import React, {useEffect, useState} from 'react';
import {Col, ColorPicker, Input, Row, Space} from 'antd';

import {SettingValue} from '../../../Types/api';
import './styles.less';
import IconButton from '../../../CommonUI/IconButton';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {TrashIcon} from '@heroicons/react/24/outline';
import FileUploader from '../../../CommonUI/FileUploader';

interface PreferenceValueProps {
  preference: SettingValue;
  onUpdated?: () => void;
}

const PreferenceValue = ({preference, onUpdated}: PreferenceValueProps) => {
  const [value, setValue] = useState<string | undefined>(preference.value);
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setValue(preference.value);
  }, [preference]);

  const getControl = () => {
    switch (preference.type) {
      case 'color':
        return <ColorPicker value={value} onChange={value => onChangeValue(value.toHexString())} />;
      case 'image':
        return <FileUploader showPreview imagePath={value} onFilesUploaded={file => onChangeValue(file.uuid)} />;
      default:
        return <Input placeholder={'Value'} value={value} onChange={e => onChangeValue(e.target.value)} />;
    }
  };

  const onChangeValue = (val: string) => {
    setValue(val);
    setIsModified(true);
  };

  const saveValue = () => {
    setLoading(true);
    axios
      .put('/tenant-management/settings', {value, key: preference.key})
      .then(() => {
        setLoading(false);
        if (preference.key.includes('color') || preference.key.includes('logo')) {
          location.reload();
        }
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
      <Row align={'middle'} gutter={30}>
        <Col md={6}>
          <span className={'label'}>{preference.label}</span>
          <small>{preference.hint}</small>
        </Col>
        <Col md={12}>
          <Space>
            {getControl()}
            <IconButton small disabled={!isModified} loading={loading} icon={<CheckIcon />} onClick={saveValue} />
            <IconButton small danger loading={loading} icon={<TrashIcon />} onClick={deleteValue} />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PreferenceValue;
