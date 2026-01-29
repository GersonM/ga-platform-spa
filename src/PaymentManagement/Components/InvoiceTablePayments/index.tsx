import {useState} from 'react';
import {Modal, Popconfirm, Space, Tooltip} from 'antd';
import {PiPlusBold} from 'react-icons/pi';
import {TbPencil, TbTrash} from "react-icons/tb";
import dayjs from "dayjs";
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import type {Invoice, ApiFile, InvoicePayment, WalletTransaction} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import InvoicePaymentForm from '../InvoicePaymentForm';
import IconButton from '../../../CommonUI/IconButton';
import FilePreview from "../../../CommonUI/FilePreview";

interface InvoiceTablePayments {
  invoice: Invoice;
  onChange?: () => void;
}

const InvoiceTablePayments = ({invoice, onChange}: InvoiceTablePayments) => {
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InvoicePayment>();

  const deletePayment = (uuid: string) => {
    axios.delete('payment-management/payments/' + uuid).then(() => {
      if (onChange) {
        onChange();
      }
    });
  };

  const columns = [
    {
      title: 'Fecha de pago',
      width: 140,
      dataIndex: 'transaction_date',
      render: (transaction_date: string) => {
        return transaction_date && <>
          {dayjs(transaction_date).format('DD/MM/YYYY')}
          <small>{dayjs(transaction_date).format('HH:MM a')}</small>
        </>
      }
    },
    {
      title: 'Descripción',
      dataIndex: 'method',
      render: (method: any, row: InvoicePayment) => {
        return (
          <>
            {row.transaction?.payment_channel}
            <br/>
            <small>{method?.number}</small>
          </>
        );
      },
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      render: (value: number, row: InvoicePayment) => {
        return <>
          <MoneyString currency={invoice.currency} value={value}/>
          {row.exchange_rate && row.exchange_amount && (
            <Tooltip title={row.exchange_rate / 1000}>
              <small><MoneyString value={row.exchange_amount} currency={row.exchange_currency}/></small>
            </Tooltip>
          )}
        </>
      },
    },
    {
      title: 'N° Voucher',
      dataIndex: 'transaction',
      width: 150,
      render: (transaction: WalletTransaction) => {
        return (transaction && <div>
          {transaction.tracking_id}
        </div>)
      }
    },
    {
      title: 'Doc.',
      dataIndex: 'transaction',
      width: 190,
      render: (transaction: WalletTransaction) => {
        return <Space wrap>
          {transaction.attachments?.map(f =>
            <FilePreview fileUuid={f.uuid}/>
          )}
        </Space>;
      },
    },
    {
      title: '',
      dataIndex: 'uuid',
      render: (uuid: string, p: InvoicePayment) => {
        return (
          <Space>
            <IconButton icon={<TbPencil/>} small onClick={() => {
              setSelectedPayment(p);
              setOpenInvoiceForm(true);
            }}/>
            <Popconfirm title={'¿Quieres eliminar este concepto?'} onConfirm={() => deletePayment(uuid)}>
              <IconButton icon={<TbTrash/>} small danger/>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <TableList small columns={columns} dataSource={invoice.payments} pagination={false}/>
      <PrimaryButton
        icon={<PiPlusBold size={14}/>}
        style={{marginTop: '10px'}}
        label={'Registrar pago'}
        block
        ghost
        size={'small'}
        onClick={() => {
          setOpenInvoiceForm(true);
          setSelectedPayment(undefined);
        }}
      />
      <Modal destroyOnHidden open={openInvoiceForm} onCancel={() => setOpenInvoiceForm(false)} footer={false}>
        <InvoicePaymentForm
          invoice={invoice}
          payment={selectedPayment}
          onCompleted={() => {
            setOpenInvoiceForm(false);
            if (onChange) {
              onChange();
            }
          }}
        />
      </Modal>
    </>
  );
};

export default InvoiceTablePayments;
