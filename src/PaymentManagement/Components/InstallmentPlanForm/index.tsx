import React from 'react';
import axios from "axios";
import type {Contract} from "../../../Types/api.tsx";
import {Col, DatePicker, Form, InputNumber, Row} from "antd";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {TbPlus} from "react-icons/tb";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import MoneyInput from "../../../CommonUI/MoneyInput";

interface InstallmentPlanProps {
  contract: Contract;
  onComplete?: () => void;
}

const InstallmentPlanForm = ({contract, onComplete}: InstallmentPlanProps) => {
  const submit = (values: any) => {
    axios.post(`commercial/contracts/${contract.uuid}/installment-plan`, {
      ...values,
      amount: values?.amount || contract.amount,
    })
      .then(() => {
        if (onComplete) onComplete();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }
  return (
    <>
      <h2>Generar plan de pagos</h2>
      <Form layout="vertical" onFinish={submit}>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Form.Item label={'Monto'} name={'amount'}>
              <MoneyInput currency={contract.currency} defaultValue={contract.amount} />
            </Form.Item>
            <Form.Item label={'Número de cuotas'} name={'num_payments'}>
              <InputNumber style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label={'Interés mensual'} name={'interest_rate'}>
              <InputNumber style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item label={'Fecha de inicio'} name={'date_start'}>
              <DatePicker style={{width: '100%'}}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <h3>Resumen</h3>
          </Col>
        </Row>
        <PrimaryButton htmlType={'submit'} block icon={<TbPlus/>} label={'Generar'}/>
      </Form>
    </>
  );
};

export default InstallmentPlanForm;
