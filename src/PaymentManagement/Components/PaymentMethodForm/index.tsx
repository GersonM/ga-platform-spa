import React, {useState} from 'react';
import {Checkbox, DatePicker, Form, Input, Select} from "antd";
import type {PaymentMethod} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethod;
  onComplete?: () => void;
  profileUuid: string;
}

const PaymentMethodForm = ({paymentMethod, onComplete, profileUuid}: PaymentMethodFormProps) => {
  const [selectedType, setSelectedType] = useState<string>();

  const submitForm = (values: any) => {
    axios
      .request({
        url: paymentMethod ? `payment-management/payment-methods/${paymentMethod.uuid}` : 'payment-management/payment-methods',
        method: paymentMethod ? 'put' : 'post',
        data: {...values, fk_profile_uuid: profileUuid},
    })
    .then(() => {
      if(onComplete) onComplete();
    })
    .catch(err => {
      ErrorHandler.showNotification(err);
    })
  }

  return (
    <div>
      <h3>Método de pago</h3>
      <Form layout="vertical" onFinish={submitForm} initialValues={paymentMethod}>
        <Form.Item name={'type'} label={'Tipo'}>
          <Select
            onChange={(value) => setSelectedType(value)}
            options={[
            {label: 'Tarjeta Crédito/Débido', value: 'card'},
            {label: 'Paypal', value: 'paypal'},
            {label: 'Payu', value: 'payu'},
            {label: 'Niubiz', value: 'niubiz'},
            {label: 'Yape', value: 'yape'},
          ]}/>
        </Form.Item>
        <Form.Item name={'name'} label={'Nombre en la tarjeta'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'number'} label={'Número'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'issuer'} label={'Entidad'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'expiri_date'} label={'Fecha de expiración'}>
          <DatePicker />
        </Form.Item>
        <Form.Item name={'is_default'} valuePropName={'checked'}>
          <Checkbox>Usar como método de pago principal</Checkbox>
        </Form.Item>
        <PrimaryButton block htmlType="submit" label={'Guardar'}/>
      </Form>
    </div>
  );
};

export default PaymentMethodForm;
