import React from 'react';
import {Form, Input} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {PiCheckBold, PiCheckLight} from 'react-icons/pi';

const InvoiceForm = () => {
  return (
    <Form layout="vertical">
      <Form.Item label={'Amount'}>
        <Input />
      </Form.Item>
      <Form.Item label={'Concepto'}>
        <Input />
      </Form.Item>
      <PrimaryButton label={'Guardar'} block htmlType={'submit'} icon={<PiCheckBold size={18} />} />
    </Form>
  );
};

export default InvoiceForm;
