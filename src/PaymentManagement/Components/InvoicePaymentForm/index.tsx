import {useEffect, useState} from 'react';
import {Col, DatePicker, Form, Input, Row, Space, Collapse, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {PiCheck} from 'react-icons/pi';
import dayjs, {type Dayjs} from "dayjs";
import axios from 'axios';
import Decimal from 'decimal.js';

import type {Invoice, InvoicePayment} from '../../../Types/api';
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';
import MoneyInput from "../../../CommonUI/MoneyInput";
import Config from "../../../Config.tsx";
import CustomTag from "../../../CommonUI/CustomTag";
import {WalletSelector} from "../WalletSelector";
import InvoiceChip from "../InvoiceChip";

interface InvoicePaymentProps {
  onCompleted: () => void;
  invoice: Invoice;
  payment?: InvoicePayment;
}

const InvoicePaymentForm = ({onCompleted, invoice, payment}: InvoicePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [fileUuid, setFileUuid] = useState<string>();
  const [enableExchange, setEnableExchange] = useState(!!payment?.exchange_amount);
  const [exchangeValues, setExchangeValues] = useState<any>();
  const [exchangeAmount, setExchangeAmount] = useState<number>();
  const [paymentAmount, setPaymentAmount] = useState<number>();
  const [exchangeRate, setExchangeRate] = useState<number>();
  const [defaultChangeRate, setDefaultChangeRate] = useState<number>(0);
  const [transactionDate, setTransactionDate] = useState<Dayjs>();
  const [form] = useForm();

  const exchangeCurrency = invoice.currency == 'USD' ? 'PEN' : 'USD';

  useEffect(() => {
    if (!enableExchange) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {date: transactionDate?.format('YYYY-MM-DD')}
    };

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
  }, [enableExchange, transactionDate]);

  useEffect(() => {
    console.log({exchangeRate});
    if (form && exchangeAmount && (exchangeRate || defaultChangeRate)) {
      form.setFieldValue('amount', exchangeAmount * (exchangeRate ? exchangeRate : defaultChangeRate));
    }
  }, [exchangeRate, exchangeAmount, form]);

  useEffect(() => {
    if (form && paymentAmount && (exchangeRate || defaultChangeRate)) {
      const rate = exchangeRate ? exchangeRate : defaultChangeRate
      const targetAmount = new Decimal(paymentAmount);
      form.setFieldValue('exchange_amount', targetAmount.dividedBy(rate).toNearest(3).toString());
    }
  }, [paymentAmount, form]);

  const submitForm = (values: any) => {
    const data = {
      invoice_uuid: invoice.uuid,
      file_uuid: fileUuid,
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
        <div>
          <Collapse
            size={"small"}
            style={{marginBottom: 15}}
            activeKey={enableExchange ? [0] : undefined}
            onChange={v => {
              setEnableExchange(!!v.length);
            }}
            destroyOnHidden
            items={[
              {
                label: 'Registrar pago en otro moneda',
                id: 'change',
                children: <>
                  <Row gutter={15}>
                    <Col span={12}>
                      <Form.Item name={'exchange_amount'} label={'Monto a cambiar'}>
                        <MoneyInput
                          currency={exchangeCurrency}
                          onChange={(v) => setExchangeAmount(v)}/>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={'Tipo de cambio'}>
                        <MoneyInput
                          value={(exchangeRate || payment?.exchange_rate)/1000}
                          returnInteger={false}
                          onChange={(v) => setExchangeRate(v*1000)}
                          placeholder={defaultChangeRate?.toString()}
                          currency={exchangeCurrency}/>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name={'exchange_wallet_uuid'} label={'Cuenta de destino'} rules={[{required: true}]}>
                    <WalletSelector currency={exchangeCurrency}/>
                  </Form.Item>
                  <Space>
                    Tipo de cambio SUNAT:
                    <CustomTag>
                      <Tooltip title={exchangeValues?.buy}>
                        Compra: S/ {exchangeValues?.buy_reverse}
                      </Tooltip>
                    </CustomTag>
                    <CustomTag>
                      Venta: S/ {exchangeValues?.sell}
                    </CustomTag>
                  </Space>
                </>
              }
            ]}
          />
        </div>
        <Row gutter={[15, 15]}>
          <Col span={9}>
            <Form.Item name={'payment_channel'} label={'Método de pago'}>
              <PaymentMethodTypesSelector/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'amount'} label={'Monto'} rules={[{required: true}]}>
              <MoneyInput currency={invoice.currency || 'PEN'} onChange={(v) => setPaymentAmount(v)}/>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name={'transaction_date'} label={'Fecha de pago'}>
              <DatePicker onChange={d => setTransactionDate(d)} placeholder={'Hoy'} format={Config.dateFormatUser}/>
            </Form.Item>
          </Col>
        </Row>
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
        <PrimaryButton icon={<PiCheck/>} block loading={loading} label={'Guardar'} htmlType={'submit'}/>
      </Form>
    </>
  );
};

export default InvoicePaymentForm;
