import {useEffect, useState} from 'react';
import {Col, DatePicker, Form, Input, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {PiCheck} from 'react-icons/pi';
import dayjs from "dayjs";
import axios from 'axios';

import type {ApiFile, Wallet, WalletTransaction} from '../../../Types/api';
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';
import MoneyInput from "../../../CommonUI/MoneyInput";
import Config from "../../../Config.tsx";
import {WalletSelector} from "../WalletSelector";

interface InvoicePaymentProps {
  onCompleted?: (t:WalletTransaction) => void;
  transaction?: WalletTransaction;
  wallet?: Wallet;
  type?: 'deposit' | 'withdraw' | 'transfer' | string;
}

const WalletTransactionForm = ({onCompleted, transaction, wallet, type}: InvoicePaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<ApiFile>();
  const [selectedWallet, setSelectedWallet] = useState<Wallet|undefined>(wallet);
  const [form] = useForm();

  useEffect(() => {
    if(uploadedFile && form) {
      form.setFieldsValue({
        transaction_date: uploadedFile.metadata?.fecha_pago ? dayjs(uploadedFile.metadata.fecha_pago) : undefined,
        amount: uploadedFile.metadata ? uploadedFile.metadata?.monto * 100 : undefined,
        tracking_id: uploadedFile.metadata?.numero_operacion,
        currency: uploadedFile.metadata?.moneda,
      });
    }
  }, [uploadedFile, form]);

  useEffect(() => {
    if (transaction?.wallet_to) {
      setSelectedWallet(transaction?.wallet_to);
    } else {
      setSelectedWallet(transaction?.wallet_from);
    }
  }, [transaction])

  const submitForm = (values: any) => {
    const data = {
      file_uuid: uploadedFile?.uuid,
      type,
      ...values,
    };
    setLoading(true);
    axios
      .request({
        url: transaction ? `payment-management/transactions/${transaction.uuid}` : 'payment-management/transactions',
        method: transaction ? 'put' : 'post',
        data,
      })
      .then((res) => {
        setLoading(false);
        if (onCompleted) {
          onCompleted(res.data);
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
      <h3>{transaction ? 'Editar transacción' : type == 'deposit' ? 'Registrar ingreso' : 'Registrar salida'}</h3>
      <Form
        form={form}
        initialValues={transaction && {...transaction, transaction_date: dayjs(transaction.transaction_date)}}
        layout={'vertical'}
        onFinish={submitForm}>
        {type == 'deposit' && (
          <Form.Item name={'wallet_to_uuid'} label={'Destino'} rules={[{required: true}]}>
            <WalletSelector onChange={(_uuid, w) => {
              setSelectedWallet(w.entity);
            }}/>
          </Form.Item>
        )}
        {type == 'withdraw' && (
          <Form.Item name={'wallet_from_uuid'} label={'Origen'} rules={[{required: true}]}>
            <WalletSelector onChange={(_uuid, w) => {
              setSelectedWallet(w.entity);
            }}/>
          </Form.Item>
        )}
        <Row gutter={[15, 15]}>
          <Col span={9}>
            <Form.Item name={'payment_channel'} label={'Método de pago'}>
              <PaymentMethodTypesSelector/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'amount'} label={'Monto'} rules={[{required: true}]}>
              <MoneyInput currency={selectedWallet?.currency}/>
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name={'transaction_date'} label={'Fecha de pago'}>
              <DatePicker placeholder={'Hoy'} format={Config.dateFormatUser}/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'tracking_id'} label={'N° Voucher / Operación'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Foto del comprobante'}>
          <FileUploader
            metadataExtract={'financial'}
            onFilesUploaded={file => {
              setUploadedFile(file);
            }}
          />
        </Form.Item>
        <Form.Item name={'observations'} label={'Descripción (opcional)'} tooltip={'Información adicional'}>
          <Input/>
        </Form.Item>
        <PrimaryButton icon={<PiCheck/>} block loading={loading} label={'Guardar'} htmlType={'submit'}/>
      </Form>
    </>
  );
};

export default WalletTransactionForm;
