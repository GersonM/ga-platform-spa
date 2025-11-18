import {useState} from 'react';
import {Col, Form, Input, InputNumber, Row} from 'antd';
import axios from 'axios';
import {useForm} from 'antd/lib/form/Form';

import type {Invoice, InvoiceItem, StorageStock} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import MoneyInput from "../../../CommonUI/MoneyInput";

interface InvoiceItemFormProps {
  invoiceItem?: InvoiceItem;
  invoice: Invoice;
  onCompleted?: () => void;
}

const InvoiceItemForm = (
  {
    invoiceItem,
    invoice,
    onCompleted,
  }: InvoiceItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [form] = useForm();

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .request({
        url: invoiceItem ? `payment-management/invoice-items/${invoiceItem.uuid}` : 'payment-management/invoice-items',
        method: invoiceItem ? 'put' : 'post',
        data: {...values, invoice_uuid: invoice.uuid,},
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
    <Form form={form} initialValues={invoiceItem} onFinish={submitForm} layout={'vertical'}>
      <Row gutter={20}>
        <Col sm={13}>
          <Form.Item name={'concept'} label={'Concepto'}>
            <Input placeholder={selectedStock?.variation?.product?.name}/>
          </Form.Item>
        </Col>
        <Col sm={6}>
          <Form.Item name={'amount'} label={'Monto'}>
            <MoneyInput currency={invoice.currency || 'PEN'}/>
          </Form.Item>
        </Col>
        <Col sm={5}>
          <Form.Item name={'quantity'} label={'Cantidad'}>
            <InputNumber placeholder={'1'} style={{width:'100%'}} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name={'stock_uuid'} label={'Llenar desde producto (opcional)'}>
        <StockSelector onChange={(_vale, opt) => {
          setSelectedStock(opt.entity);
          const s = opt.entity
          form.setFieldValue('concept', s.sku + ' - ' + (s.name || s.variation.name));
          form.setFields([
            {name: 'amount', value: s.sale_price},
            {name: 'concept', value: s.serial_number + ' - ' + (s.name || s.variation.name)}
          ]);
          console.log(opt);
        }}/>
      </Form.Item>
      <PrimaryButton block loading={loading} label={'Guardar'} htmlType={'submit'}/>
    </Form>
  );
};

export default InvoiceItemForm;
