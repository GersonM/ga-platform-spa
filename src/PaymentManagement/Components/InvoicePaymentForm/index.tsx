import React, {useState} from 'react';
import {Col, Form, Input, InputNumber, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Invoice, InvoicePayment, Profile} from '../../../Types/api';
import FileUploader from '../../../CommonUI/FileUploader';

interface InvoicePaymentProps {
  onCompleted: () => void;
  invoice: Invoice;
  payment?: InvoicePayment;
}

const InvoicePaymentForm = ({onCompleted, invoice, payment}: InvoicePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [form] = useForm();

  const submitForm = (values: InvoicePayment) => {
    setLoading(true);
    axios
      .request({
        url: payment ? `payment-management/payments/${payment.uuid}` : 'payment-management/payments',
        method: payment ? 'put' : 'post',
        data: {...values, invoice_uuid: invoice.uuid},
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
      <h1>Registrar nuevo pago</h1>
      {invoice.amount_string}
      {invoice.payments?.length}
      <Form form={form} initialValues={invoice} requiredMark={false} layout={'vertical'} onFinish={submitForm}>
        <Row gutter={[15, 15]}>
          <Col span={7}>
            <Form.Item name={'amount'} label={'Monto'} rules={[{required: true}]}>
              <InputNumber style={{width: '100%'}} prefix={'S/'} />
            </Form.Item>
          </Col>
          <Col span={17}>
            <Form.Item name={'description'} label={'Descripción'} rules={[{required: true}]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'voucher_code'} label={'Comprobante'} rules={[{required: true}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'voucher_code'} label={'Comprobante'} rules={[{required: true}]}>
          <FileUploader />
        </Form.Item>
        <Form.Item name={'transaction_info'} label={'Información adicional (opcional)'}>
          <Input />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default InvoicePaymentForm;
