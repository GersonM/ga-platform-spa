import React from 'react';
import {Form, InputNumber, Select} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

const BulkEstateUpdate = () => {
  return (
    <Form layout="vertical">
      <Form.Item label={'Estado'} name={'status'}>
        <Select
          placeholder={'Todas'}
          allowClear
          style={{width: 120}}
          options={[
            {label: 'En construcción', value: 'building'},
            {label: 'Disponible', value: 'available'},
            {label: 'Vendido', value: 'sell'},
          ]}
        />
      </Form.Item>
      <Form.Item label={'Progreso'} name={'progress'}>
        <InputNumber addonAfter={'%'} />
      </Form.Item>
      <PrimaryButton htmlType={'submit'} label={'Guardar'} block />
    </Form>
  );
};

export default BulkEstateUpdate;
