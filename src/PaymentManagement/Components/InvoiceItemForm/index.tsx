import {useState} from 'react';
import {Col, Form, Input, InputNumber, Row} from 'antd';
import type {InvoiceItem, StorageStock} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {useForm} from 'antd/lib/form/Form';
import StockSelector from '../../../WarehouseManager/Components/StockSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import MoneyInput from "../../../CommonUI/MoneyInput";

interface InvoiceItemFormProps {
  invoiceItem?: InvoiceItem;
  invoiceUuid?: string;
  onCompleted?: () => void;
  invoiceOwnerUuid?: string;
  invoiceOwnerType?: string;
  invoiceableUuid?: string;
  invoiceableType?: string;
}

const InvoiceItemForm = ({
  invoiceItem,
  invoiceUuid,
  onCompleted,
  invoiceOwnerUuid,
  invoiceOwnerType,
  invoiceableUuid,
  invoiceableType,
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
        data: {
          ...values,
          invoice_uuid: invoiceUuid,
          invoice_owner_uuid: invoiceOwnerUuid,
          invoice_owner_type: invoiceOwnerType,
          invoiceable_uuid:invoiceableUuid,
          invoiceable_type:invoiceableType,
        },
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
      <Form.Item name={'concept'} label={'Concepto'}>
        <Input placeholder={selectedStock?.product?.name} />
      </Form.Item>
      <Row gutter={20}>
        <Col sm={11}>
          <Form.Item name={'stock'} label={'Producto (opcional)'}>
            <StockSelector onChange={(_vale, stock) => setSelectedStock(stock)} />
          </Form.Item>
        </Col>
        <Col sm={7}>
          <Form.Item name={'amount'} label={'Monto'}>
            <MoneyInput />
          </Form.Item>
        </Col>
        <Col sm={6}>
          <Form.Item name={'quantity'} label={'Cantidad'}>
            <InputNumber placeholder={'1'} />
          </Form.Item>
        </Col>
      </Row>
      <PrimaryButton block loading={loading} label={'Guardar'} htmlType={'submit'} />
    </Form>
  );
};

export default InvoiceItemForm;
