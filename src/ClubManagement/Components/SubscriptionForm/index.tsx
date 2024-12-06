import React, {useState} from 'react';
import {Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select} from 'antd';
import axios from 'axios';

import ProfileSelector from '../../../CommonUI/ProfileSelector';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import AlertMessage from '../../../CommonUI/AlertMessage';
import {Plan, Subscription} from '../../../Types/api';
import SubscriptionPlanSelector from '../SubscriptionPlanSelector';

interface SubscriptionFormProps {
  onComplete?: () => void;
  subscription?: Subscription;
}

const SubscriptionForm = ({subscription, onComplete}: SubscriptionFormProps) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>();

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

  console.log(selectedPlan);

  return (
    <div>
      <h2>Crear subscripción</h2>
      <Form onFinish={submitForm} layout="vertical" initialValues={subscription}>
        <Row gutter={[20, 20]}>
          <Col xs={8}>
            <Form.Item label={'Código de socio'} name={'code'} rules={[{required: true}]}>
              <InputNumber prefix={'N°'} />
            </Form.Item>
          </Col>
          <Col xs={16}>
            <Form.Item name={'started_at'} label={'Fecha de inicio'} extra={'El socio estará activo desde esta fecha'}>
              <DatePicker placeholder={'Hoy'} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'fk_profile_uuid'} label={'Socio titular'} rules={[{required: true}]}>
          <ProfileSelector />
        </Form.Item>
        <Divider>Subscripción</Divider>
        <Form.Item label={'Plan'} name={'fk_plan_uuid'}>
          <SubscriptionPlanSelector
            onChange={(_uuid: string, item: any) => {
              setSelectedPlan(item.entity);
            }}
          />
        </Form.Item>
        <Form.Item name={'amount'} label={'Precio'}>
          <InputNumber prefix={'S/'} placeholder={selectedPlan ? (selectedPlan?.price / 100).toString() : ''} />
        </Form.Item>
        <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
          <Input.TextArea />
        </Form.Item>
        <AlertMessage message={'El núcleo familiar se podrá agregar posteriormente'} type={'info'} />
        <PrimaryButton label={'Crear'} htmlType={'submit'} block />
      </Form>
    </div>
  );
};

export default SubscriptionForm;
