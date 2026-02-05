import {useEffect, useState} from 'react';
import {Col, ColorPicker, Input, InputNumber, Row, Select, Space, Switch} from 'antd';
import {TbCheck, TbTrash} from "react-icons/tb";
import axios from 'axios';

import type {SettingValue} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileUploader from '../../../FileManagement/Components/FileUploader';
import './styles.less';

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
      /*case 'container':
        return <ContainerSelector value={preference.value} />;*/
      case 'color':
        return <ColorPicker value={value} onChange={value => onChangeValue(value.toHexString())} />;
      case 'image':
        return (
          <FileUploader
            fileUuid={preference.value}
            showPreview
            imagePath={value}
            onChange={fileUuid => onChangeValue(fileUuid)}
          />
        );
      case 'boolean':
        return <Switch defaultValue={preference.value == '1'} onChange={value => onChangeValue(value ? '1' : '0')} />;
      case 'number':
        return <InputNumber placeholder={'Value'} value={value} onChange={e => e && onChangeValue(e)} />;
      case 'multiple':
        return (
          <Select
            style={{width: '100%'}}
            mode={'multiple'}
            placeholder={'Módulo'}
            allowClear
            value={value}
            options={preference.values?.map(v => ({value: v}))}
            onChange={e => onChangeValue(e)}
          />
        );
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
      .put('/workspaces/settings', {value, key: preference.key})
      .then(() => {
        setLoading(false);
        if (preference.key.includes('color') || preference.key.includes('logo')) {
          location.reload();
        }
        setIsModified(false);
        if (onUpdated) {
          onUpdated();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const deleteValue = () => {
    setLoading(true);
    axios
      .delete('/workspaces/settings/' + preference.key)
      .then(() => {
        setLoading(false);
        if (onUpdated) {
          onUpdated();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div className={'preference-value-container'}>
      <Row align={'middle'} gutter={30}>
        <Col md={6} xs={9}>
          <span className={'label'}>{preference.label}</span>
          <small>{preference.hint}</small>
        </Col>
        <Col md={8} xs={12}>
          {getControl()}
        </Col>
        <Col md={2} xs={2}>
          <Space>
            <IconButton disabled={!isModified} loading={loading} icon={<TbCheck />} onClick={saveValue} />
            <IconButton danger loading={loading} icon={<TbTrash />} onClick={deleteValue} />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PreferenceValue;
