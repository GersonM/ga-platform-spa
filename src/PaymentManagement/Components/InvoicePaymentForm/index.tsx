import React, {useEffect, useState} from 'react';
import {Col, Form, Row, Tooltip, Button, Input} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {PiCheck} from 'react-icons/pi';
import dayjs from "dayjs";
import {LuArrowBigRightDash} from "react-icons/lu";
import axios from 'axios';

import type {Invoice, InvoicePayment, WalletTransaction} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import MoneyInput from "../../../CommonUI/MoneyInput";
import CustomTag from "../../../CommonUI/CustomTag";
import InvoiceChip from "../InvoiceChip";
import {WalletTransactionSelector} from "../WalletTransactionSelector";
import ModalView from "../../../CommonUI/ModalView";
import WalletTransactionForm from "../WalletTransactionForm";

interface InvoicePaymentProps {
  onCompleted: () => void;
  invoice: Invoice;
  payment?: InvoicePayment;
}

const InvoicePaymentForm = ({onCompleted, invoice, payment}: InvoicePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [enableExchange, setEnableExchange] = useState(!!payment?.exchange_amount);
  const [exchangeValues, setExchangeValues] = useState<any>();
  const [exchangeAmount, setExchangeAmount] = useState<number>();
  const [paymentAmount, setPaymentAmount] = useState<number>();
  const [exchangeRate, setExchangeRate] = useState<number>();
  const [defaultChangeRate, setDefaultChangeRate] = useState<number>(0);
  const [openTransactionForm, setOpenTransactionForm] = useState(false);
  const [transactionSelected, setTransactionSelected] = useState<WalletTransaction>();
  const [reload, setReload] = useState(false);
  const [form] = useForm();

  const exchangeCurrency = invoice.currency == 'USD' ? 'PEN' : 'USD';

  useEffect(() => {
    if(transactionSelected){
      const selectedCurrency = transactionSelected?.wallet_to?.currency ?? transactionSelected?.wallet_from?.currency;
      setEnableExchange(!!selectedCurrency && (selectedCurrency != invoice.currency));
    }
  }, [transactionSelected]);

  useEffect(() => {
    if (!enableExchange) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token,};

    setLoading(true);

    axios
      .get(`payment-management/exchange-values`, config)
      .then(response => {
        if (response) {
          setExchangeValues(response.data);
          setDefaultChangeRate(invoice.currency == 'USD' ? response.data.buy : response.data.sell);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [enableExchange]);

  useEffect(() => {
    console.log({exchangeRate});
    if (form && exchangeAmount && paymentAmount) {
      setExchangeRate((paymentAmount / exchangeAmount));
    }
  }, [exchangeAmount, form, paymentAmount]);

  const submitForm = (values: any) => {
    const data = {
      invoice_uuid: invoice.uuid,
      ...values,
    };
    if (enableExchange) {
      data.exchange_currency = exchangeCurrency;
      data.exchange_rate = Math.round((exchangeRate || defaultChangeRate) * 1000);
    }
    console.log('rate', data.exchange_rate);
    setLoading(true);
    axios
      .request({
        url: payment ? `payment-management/payments/${payment.uuid}` : 'payment-management/payments',
        method: payment ? 'put' : 'post',
        data,
      })
      .then(() => {
        setLoading(false);
        if (onCompleted) {
          onCompleted();
          form.resetFields();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const selectedCurrency = transactionSelected?.wallet_to?.currency ?? transactionSelected?.wallet_from?.currency;

  return (
    <>
      <h3>{payment ? 'Editar pago' : 'Registrar nuevo pago'}</h3>
      <InvoiceChip invoice={invoice}/>
      <Form
        form={form}
        initialValues={payment ? {
          ...payment,
          transaction_date: dayjs(payment.transaction_date)
        } : {amount: invoice.pending_payment}}
        layout={'vertical'}
        onFinish={submitForm}>
        <Form.Item
          label={'Transacción'}
          extra={<Button size={"small"} onClick={() => setOpenTransactionForm(true)}>Nueva transacción</Button>}
          name={'wallet_transaction_uuid'}>
          <WalletTransactionSelector refresh={reload} onChange={(d, i) => {
            setTransactionSelected(i.entity);
          }} currency={invoice.currency || 'PEN'}/>
        </Form.Item>
        <Row gutter={[15, 15]} align="middle">
          {selectedCurrency != invoice.currency && (<>
            <Col span={10}>
              <Form.Item name={'exchange_amount'} label={'Monto a cambiar'}>
                <MoneyInput
                  currency={exchangeCurrency}
                  onChange={(v) => setExchangeAmount(v)}/>
              </Form.Item>
            </Col>
            <Col span={4} style={{textAlign: 'center'}}>
              <LuArrowBigRightDash size={30}/>
            </Col>
          </>)}
          <Col span={10}>
            <Form.Item name={'amount'} label={'Monto'} rules={[{required: true}]}>
              <MoneyInput currency={invoice.currency || 'PEN'} onChange={v => setPaymentAmount(v)}/>
            </Form.Item>
          </Col>
        </Row>
        {selectedCurrency && selectedCurrency != invoice.currency && (
          <div>
            <Form.Item label={'Tipo de cambio'}>
              <Input
                value={exchangeRate}
                placeholder={defaultChangeRate?.toString()}
              />
            </Form.Item>
            <p>
              Tipo de cambio SUNAT:
              <CustomTag><Tooltip title={exchangeValues?.buy}>Compra:
                S/ {exchangeValues?.buy_reverse}</Tooltip></CustomTag> {' '}
              <CustomTag>Venta: S/ {exchangeValues?.sell}</CustomTag>
            </p>
          </div>
        )}
        {/*
        <div>
          {!enableExchange &&
            <Form.Item name={'wallet_uuid'} label={'Destino'} rules={[{required: true}]}>
              <WalletSelector currency={invoice.currency || 'PEN'}/>
            </Form.Item>
          }
          <Form.Item name={'voucher_code'} label={'N° Voucher / Operación'}>
            <Input/>
          </Form.Item>
          <Form.Item name={'purchase_token'} label={'ID Transacción (opcional)'}>
            <Input placeholder={'Autogenerado'}/>
          </Form.Item>
          <Form.Item label={'Foto del comprobante'}>
            <FileUploader
              onFilesUploaded={file => {
                setFileUuid(file.uuid);
              }}
            />
          </Form.Item>
          <Form.Item name={'description'} label={'Descripción (opcional)'} tooltip={'Información adicional'}>
            <Input/>
          </Form.Item>
        </div>
        */}
        <PrimaryButton icon={<PiCheck/>} block loading={loading} label={'Guardar'} htmlType={'submit'}/>
      </Form>
      <ModalView
        width={700}
        onCancel={() => {
          setOpenTransactionForm(false);
        }} open={openTransactionForm}>
        <WalletTransactionForm type={'deposit'} onCompleted={(t: any) => {
          console.log(t)
          setOpenTransactionForm(false);
          setReload(!reload);
        }}/>
      </ModalView>
    </>
  );
};

export default InvoicePaymentForm;
