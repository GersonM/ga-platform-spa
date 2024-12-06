import React from 'react';
import {Col, DatePicker, Form, Input, InputNumber, Row, Select} from 'antd';
import axios from 'axios';

import ProfileSelector from '../../../CommonUI/ProfileSelector';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import AlertMessage from '../../../CommonUI/AlertMessage';

interface CreateSubscriptionFormProps {
  onComplete?: () => void;
}

const CreateSubscriptionForm = ({onComplete}: CreateSubscriptionFormProps) => {
  const submitForm = (values: any) => {
    axios
      .post('subscriptions', values)
      .then(res => {
        onComplete && onComplete();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <div>
      <h2>Crear subscripción</h2>
      <AlertMessage message={'El núcleo familiar se podrá agregar posteriormente'} type={'info'} />
      <Form onFinish={submitForm} layout="vertical">
        <Form.Item label={'Código de socio'} name={'code'} rules={[{required: true}]}>
          <InputNumber prefix={'N°'} />
        </Form.Item>
        <Form.Item name={'holder_uuid'} label={'Socio titular'} rules={[{required: true}]}>
          <ProfileSelector />
        </Form.Item>
        <Row gutter={[20, 20]}>
          <Col xs={12}>
            <Form.Item name={'started_at'} label={'Fecha de inicio'} extra={'El socio estará activo desde esta fecha'}>
              <DatePicker placeholder={'Hoy'} />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item name={'amount'} label={'Precio'}>
              <InputNumber prefix={'S/'} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={'Plan'} name={'plan_uuid'}>
          <Select />
        </Form.Item>
        <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
          <Input.TextArea />
        </Form.Item>
        <PrimaryButton label={'Crear'} htmlType={'submit'} block />
      </Form>
    </div>
  );
};

export default CreateSubscriptionForm;
