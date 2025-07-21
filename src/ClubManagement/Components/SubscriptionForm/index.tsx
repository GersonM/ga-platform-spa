import {useEffect, useState} from 'react';
import {Col, DatePicker, Divider, Form, Input, InputNumber, Row, Space} from 'antd';
import axios from 'axios';

import ProfileSelector from '../../../CommonUI/ProfileSelector';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import AlertMessage from '../../../CommonUI/AlertMessage';
import type {Plan, Subscription} from '../../../Types/api';
import SubscriptionPlanSelector from '../SubscriptionPlanSelector';
import dayjs from 'dayjs';
import {useForm} from 'antd/lib/form/Form';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import MoneyInput from "../../../CommonUI/MoneyInput";
import IconButton from "../../../CommonUI/IconButton";
import {TbPencil} from "react-icons/tb";

interface SubscriptionFormProps {
  onComplete?: () => void;
  subscription?: Subscription;
}

const SubscriptionForm = ({subscription, onComplete}: SubscriptionFormProps) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [selectedSubscription, setSelectedSubscription] = useState<any>();
  const [editHolderProfile, setEditHolderProfile] = useState(false)
  const [form] = useForm();

  useEffect(() => {
    form.resetFields();
  }, [selectedSubscription]);

  useEffect(() => {
    console.log(subscription);
    if (subscription) {
      setSelectedSubscription({
        ...subscription,
        fk_profile_uuid: subscription.members.find(m => m.relation_type == 'SOCIO')?.profile.uuid,
        fk_plan_uuid: subscription.plan.uuid,
        started_at: dayjs(subscription.started_at),
      });
      setSelectedPlan(subscription.plan);
    }
  }, [subscription]);

  const submitForm = (values: any) => {
    axios
      .request({
        url: subscription ? `subscriptions/${subscription.uuid}` : 'subscriptions',
        method: subscription ? 'PUT' : 'POST',
        data: values,
      })
      .then(_res => {
        if (onComplete) {
          onComplete();
        }
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <>
      <Form form={form} onFinish={submitForm} layout="vertical" initialValues={selectedSubscription}>
        <Row gutter={[20, 20]}>
          <Col xs={8}>
            <Form.Item label={'Código de socio'} name={'code'} rules={[{required: true}]}>
              <InputNumber prefix={'N°'}/>
            </Form.Item>
          </Col>
          <Col xs={16}>
            <Form.Item name={'started_at'} label={'Fecha de inicio'} extra={'El socio estará activo desde esta fecha'}>
              <DatePicker placeholder={'Hoy'}/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'fk_profile_uuid'} label={'Socio titular'} rules={subscription?undefined:[{required: true}]}>
          {(!editHolderProfile && subscription) ?
            <Space>
              <ProfileChip profile={subscription.holder_profile} showDocument/>
              <IconButton icon={<TbPencil />} onClick={() => setEditHolderProfile(true)} />
            </Space>
            :
            <ProfileSelector placeholder={subscription?.holder_profile?.name}/>
          }
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
          <MoneyInput placeholder={selectedPlan ? (selectedPlan?.price / 100).toString() : ''}/>
        </Form.Item>
        <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
          <Input.TextArea/>
        </Form.Item>
        {!subscription && <AlertMessage message={'El núcleo familiar se podrá agregar posteriormente'} type={'info'}/>}
        <PrimaryButton label={'Guardar'} htmlType={'submit'} block/>
      </Form>
    </>
  );
};

export default SubscriptionForm;
