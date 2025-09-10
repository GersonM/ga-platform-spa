import React, {useState} from 'react';
import {Col, DatePicker, Divider, Form, Input, Row, Select} from "antd";
import {TbCheck} from "react-icons/tb";
import axios from "axios";

import type {Wallet} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import CurrencySelector from "../CurrencySelector";
import CountrySelector from "../../../CommonUI/CountrySelector";

interface InstallmentPlanProps {
  wallet?: Wallet;
  onComplete?: () => void;
}

const WalletForm = ({wallet, onComplete}: InstallmentPlanProps) => {
  const [loading, setLoading] = useState(false);

  const submit = (values: any) => {
    setLoading(true);
    axios
      .request({
        url: wallet ? `payment-management/wallets/${wallet.uuid}` : 'payment-management/wallets',
        method: wallet ? 'put' : 'post',
        data: values,
      })
      .then(() => {
        setLoading(false);
        if (onComplete) {
          onComplete();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <h2>Crear cuenta</h2>
      <p>Las billeteras son espacio donde se puede guardar dinero como en el caso de cuentas de banco, tarjetas de
        crédito, caja chica, cajeros, etc.</p>
      <Form layout="vertical" onFinish={submit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={'Entidad'} name={'bank_name'}>
              <Select options={[
                {label: 'Interno', value: 'internal'},
                {label: 'BCP', value: 'bcp'},
                {label: 'Interbank', value: 'interbank'},
                {label: 'PayPal', value: 'paypal'},
                {label: 'BBVA', value: 'bbva'},
                {label: 'Scotiabank', value: 'scotiabank'},
                {label: 'Caja chica', value: 'caja_chica'},
              ]}/>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label={'N° / ID de cuenta'} name={'account_number'}>
              <Input/>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={'Moneda'} name={'currency'}>
              <CurrencySelector/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={'CCI'} name={'international_account_number'}>
          <Input/>
        </Form.Item>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Form.Item label={'País'} name={'country_code'}>
              <CountrySelector />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Fecha de creación'} name={'issued_at'}>
              <DatePicker style={{width: '100%'}}/>
            </Form.Item>
          </Col>
        </Row>
        <Divider>Información adicional</Divider>
        <Form.Item label={'Nombre'} name={'name'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Descripción'} name={'description'}>
          <Input.TextArea/>
        </Form.Item>
        <PrimaryButton
          loading={loading}
          htmlType={'submit'} block icon={<TbCheck/>}
          label={'Guardar'}/>
      </Form>
    </>
  );
};

export default WalletForm;
