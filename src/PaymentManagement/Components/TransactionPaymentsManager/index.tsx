import {useEffect, useState} from 'react';
import {Modal, Popconfirm, Space} from 'antd';
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

interface TransactionPaymentsManagerProps {
  transaction: WalletTransaction;
  onChange?: () => void;
}

const TransactionPaymentsManager = ({transaction, onChange}: TransactionPaymentsManagerProps) => {
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InvoicePayment>();
  const [payments, setPayments] = useState<InvoicePayment[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [invoice, setInvoice] = useState();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {transaction_uuid: transaction.uuid},
    };

    setLoading(true);

    axios
      .get(`payment-management/payments`, config)
      .then(response => {
        if (response) {
          setPayments(response.data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

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
            {row.description}
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
          <MoneyString currency={row.invoice?.currency} value={value}/>
          {row.exchange_amount && (
            <>
              <small><MoneyString value={row.exchange_amount} currency={'PEN'}/></small>
            </>
          )}
        </>
      },
    },
    {
      title: 'N° Voucher',
      dataIndex: 'voucher_code',
      width: 150,
    },
    {
      title: 'Doc.',
      dataIndex: 'attachments',
      width: 190,
      render: (attachments: ApiFile[]) => {
        return <Space wrap>
          {attachments?.map(f =>
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
      <h3>Pagos relacionados</h3>
      <TableList small columns={columns} dataSource={payments} pagination={false}/>
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
        {invoice &&
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
        }
      </Modal>
    </>
  );
};

export default TransactionPaymentsManager;
