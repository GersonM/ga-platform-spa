import React, {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Row, Space, Tag} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";
import dayjs, {type Dayjs} from "dayjs";

import MoneyString from "../../../CommonUI/MoneyString";
import type {Invoice} from "../../../Types/api.tsx";
import CurrencySelector from "../CurrencySelector";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";

interface InvoiceFormProps {
  invoice?: Invoice;
  onComplete?: (invoice: Invoice) => void;
  clientUuid?: string;
  contractUuid?: string;
}

const InvoiceForm = (
  {
    invoice,
    onComplete,
    clientUuid,
    contractUuid,
  }: InvoiceFormProps) => {
  const [form] = useForm();
  const [selectedCurrency, setSelectedCurrency] = useState<string>();
  const [isModified, setIsModified] = useState(false);
  const [issuedOn, setIssuedOn] = useState<Dayjs>();

  useEffect(() => {
    form.resetFields();
  }, [invoice]);

  const submit = (values: any) => {
    axios.request({
      method: invoice ? "PUT" : "POST",
      url: invoice ? "/payment-management/invoices/" + invoice.uuid : "/payment-management/invoices",
      data: {...values, client_uuid: clientUuid, contract_uuid: contractUuid,}
    })
      .then(res => {
        if (onComplete) onComplete(res.data);
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      })
  }

  return (
    <div>
      <h2>
        Solicitud de pago: {' '}
        <Tag color={'blue'}>{invoice?.tracking_id}</Tag>
      </h2>
      <Space>
        Total: <Tag color={'blue'}><MoneyString currency={invoice?.currency} value={invoice?.amount || 0}/></Tag>
        {invoice && <>
          Pendiente: {invoice?.pending_payment && (invoice?.pending_payment != 0 ?
            <Tag color={'orange'}><MoneyString currency={invoice?.currency} value={invoice?.pending_payment}/></Tag> :
            <Tag color={'green'}>Pagado</Tag>
        )}
        </>}
      </Space>
      <br/>
      <br/>
      <Form form={form} onValuesChange={() => {
        setIsModified(true);
      }} onFinish={submit}
            initialValues={{
              ...invoice,
              issued_on: invoice?.issued_on ? dayjs(invoice?.issued_on) : null,
              expires_on: invoice?.expires_on ? dayjs(invoice?.expires_on) : null
            }}
            layout="vertical">
        <Row gutter={[20, 20]}>
          <Col span={10}>
            <Form.Item label={'Moneda'} name={'currency'}>
              <CurrencySelector placeholder={'PEN S/'} onChange={(value: string) => setSelectedCurrency(value)}/>
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item label={'Monto'}>
              <MoneyString value={invoice?.amount} currency={selectedCurrency || invoice?.currency || 'PEN'}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Form.Item label={'Fecha de emisión'} name={'issued_on'}>
              <DatePicker format={'DD/MM/YYYY'} showNow={false} onChange={d => setIssuedOn(d)} style={{width: '100%'}}
                          placeholder={'Hoy'}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Fecha de vencimiento'} name={'expires_on'}>
              <DatePicker format={'DD/MM/YYYY'} showNow={false} minDate={issuedOn} style={{width: '100%'}}
                          placeholder={'En 7 días'}/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={''} name={'apply_taxes'} valuePropName={'checked'}>
          <Checkbox>Aplicar impuestos (IGV 18%)</Checkbox>
        </Form.Item>
        <PrimaryButton disabled={!isModified && !!invoice} htmlType={"submit"}
                       label={!invoice ? 'Crear' : 'Guardar cambios'} block/>
      </Form>
      {invoice &&
        <ActivityLogViewer id={invoice?.uuid} entity={'invoice'}/>
      }
    </div>
  );
};

export default InvoiceForm;
