import {useState} from 'react';
import {Modal, Popconfirm, Space} from 'antd';
import {DocumentIcon, TrashIcon} from '@heroicons/react/24/outline';
import {PiPlusBold} from 'react-icons/pi';
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import type {Invoice, ApiFile, InvoicePayment} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import InvoicePaymentForm from '../InvoicePaymentForm';
import IconButton from '../../../CommonUI/IconButton';

interface InvoiceTablePayments {
  invoice: Invoice;
  onChange?: () => void;
}

const InvoiceTablePayments = ({invoice, onChange}: InvoiceTablePayments) => {
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);

  const deletePayment = (uuid: string) => {
    axios.delete('payment-management/payments/' + uuid).then(() => {
      onChange && onChange();
    });
  };

  const columns = [
    {
      title: 'Descripción',
      dataIndex: 'method',
      render: (method: any, row: InvoicePayment) => {
        return (
          <>
            {row.description}
            <br />
            <small>{method?.number}</small>
          </>
        );
      },
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      width: 110,
      render: (value: number) => <MoneyString value={value} />,
    },
    {
      title: 'Comprobante',
      dataIndex: 'voucher_code',
      width: 110,
    },
    {
      title: 'Doc.',
      dataIndex: 'attachments',
      width: 50,
      render: (attachments: ApiFile[]) => {
        if (attachments && attachments.length > 0) {
          return (
            <a href={attachments[0].source} target={'_blank'}>
              <DocumentIcon width={16} color={'#000'} />
            </a>
          );
        }
      },
    },
    {
      title: '',
      dataIndex: 'uuid',
      render: (uuid: string) => {
        return (
          <Space>
            <Popconfirm title={'¿Quieres eliminar este concepto?'} onConfirm={() => deletePayment(uuid)}>
              <IconButton icon={<TrashIcon />} small danger />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <TableList small columns={columns} dataSource={invoice.payments} pagination={false} />
      <PrimaryButton
        icon={<PiPlusBold size={14} />}
        style={{marginTop: '10px'}}
        label={'Registrar pago'}
        block
        ghost
        size={'small'}
        onClick={() => setOpenInvoiceForm(true)}
      />
      <Modal destroyOnClose open={openInvoiceForm} onCancel={() => setOpenInvoiceForm(false)} footer={false}>
        <InvoicePaymentForm
          invoice={invoice}
          onCompleted={() => {
            setOpenInvoiceForm(false);
            onChange && onChange();
          }}
        />
      </Modal>
    </>
  );
};

export default InvoiceTablePayments;
