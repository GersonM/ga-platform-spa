import {useEffect, useState} from 'react';
import {Col, DatePicker, Form, Input, Row, Select, Tag} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {PiCheck} from 'react-icons/pi';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import type {Invoice, InvoicePayment} from '../../../Types/api';
import FileUploader from '../../../CommonUI/FileUploader';
import MoneyString from '../../../CommonUI/MoneyString';
import MoneyInput from "../../../CommonUI/MoneyInput";
import dayjs from "dayjs";
import Config from "../../../Config.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";

interface InvoicePaymentProps {
  onCompleted: () => void;
  invoice: Invoice;
  payment?: InvoicePayment;
}

const InvoicePaymentForm = ({onCompleted, invoice, payment}: InvoicePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [fileUuid, setFileUuid] = useState<string>();
  const [form] = useForm();

  const submitForm = (values: any) => {
    const data = {
      invoice_uuid: invoice.uuid,
      file_uuid: fileUuid,
      ...values,
    };
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
      <h3>Registrar nuevo pago
      </h3>
      <p>
        <Tag bordered={false} color="blue">
          {invoice.tracking_id}
        </Tag>
        Pendiente: <MoneyString currency={invoice.currency || 'PEN'} value={invoice.pending_payment} /> de <MoneyString currency={invoice.currency || 'PEN'} value={invoice.amount} />
      </p>
      <Form
        form={form}
        initialValues={payment ? {...payment, created_at: dayjs(payment.created_at)} : {amount: invoice.pending_payment}}
        requiredMark={false}
        layout={'vertical'}
        onFinish={submitForm}>
        <Row gutter={[15, 15]}>
          <Col span={10}>
            <Form.Item name={'payment_method'} label={'Método de pago'}>
              <PaymentMethodTypesSelector />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name={'amount'} label={'Monto'} rules={[{required: true}]}>
              <MoneyInput currency={invoice.currency || 'PEN'} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name={'created_at'} label={'Fecha de pago'}>
              <DatePicker placeholder={'Hoy'} format={Config.dateFormatUser} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'voucher_code'} label={'Número de comprobante / Transacción'}>
          <Input />
        </Form.Item>
        <Form.Item label={'Foto del comprobante'}>
          <FileUploader
            onFilesUploaded={file => {
              setFileUuid(file.uuid);
              console.log(file);
            }}
          />
        </Form.Item>
        <Form.Item name={'description'} label={'Descripción (opcional)'} tooltip={'Información adicional'}>
          <Input />
        </Form.Item>
        <PrimaryButton icon={<PiCheck />} block loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default InvoicePaymentForm;
