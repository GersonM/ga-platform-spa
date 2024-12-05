import React from 'react';
import {Form, Input, InputNumber} from 'antd';
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
        <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
          <Input.TextArea></Input.TextArea>
        </Form.Item>
        <PrimaryButton label={'Crear'} htmlType={'submit'} block />
      </Form>
    </div>
  );
};

export default CreateSubscriptionForm;
