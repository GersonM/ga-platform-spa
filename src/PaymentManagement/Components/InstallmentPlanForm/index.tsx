import React, {useState} from 'react';
import {Col, DatePicker, Form, InputNumber, Row} from "antd";
import {TbPlus} from "react-icons/tb";
import axios from "axios";

import type {Contract} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import MoneyInput from "../../../CommonUI/MoneyInput";
import MoneyString from "../../../CommonUI/MoneyString";

interface InstallmentPlanProps {
  contract: Contract;
  onComplete?: () => void;
}

const InstallmentPlanForm = ({contract, onComplete}: InstallmentPlanProps) => {
  const [numPayments, setNumPayments] = useState<any>();
  const [amount, setAmount] = useState<any>(contract.amount);
  const [interestRate, setInterestRate] = useState<any>();
  const [startDate, setStartDate] = useState<any>();

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

  const valorCuota = (amount && numPayments) ? Math.round(amount / numPayments) : null;

  return (
    <>
      <h2>Generar plan de pagos</h2>
      <p>Usa esta herramienta para programar varios pagos</p>
      <Form layout="vertical" onFinish={submit}>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Form.Item label={'Monto'} name={'amount'}>
              <MoneyInput currency={contract.currency} defaultValue={contract.amount / 100} onChange={setAmount}/>
            </Form.Item>
            <Form.Item label={'Número de cuotas'} name={'num_payments'}>
              <InputNumber
                min={1}
                style={{width: '100%'}}
                onChange={value => setNumPayments(value)}
              />
            </Form.Item>
            <Form.Item label={'Interés mensual'} name={'interest_rate'}>
              <InputNumber
                min={0}
                prefix={'%'} placeholder={'0'} style={{width: '100%'}}
                onChange={value => setInterestRate(value)}/>
            </Form.Item>
            <Form.Item label={'Fecha de inicio'} name={'date_start'}>
              <DatePicker style={{width: '100%'}} format={'DD/MM/YYYY'} onChange={v => setStartDate(v)}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <h3>Resumen</h3>
            {valorCuota && <>
              Valor de cuota: <MoneyString currency={contract.currency} value={valorCuota}/> <br/>
            </>}
            {valorCuota && interestRate && <>
              Interés: <MoneyString currency={contract.currency} value={valorCuota * (interestRate / 100)}/> <br/>
              Total: <MoneyString currency={contract.currency}
                                  value={(valorCuota * (interestRate / 100)) + valorCuota}/>
            </>}
          </Col>
        </Row>
        <PrimaryButton disabled={!startDate || !numPayments} htmlType={'submit'} block icon={<TbPlus/>} label={'Generar'}/>
      </Form>
    </>
  );
};

export default InstallmentPlanForm;
