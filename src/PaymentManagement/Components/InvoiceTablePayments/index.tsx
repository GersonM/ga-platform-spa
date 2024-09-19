import React, {useState} from 'react';
import {Modal} from 'antd';

import TableList from '../../../CommonUI/TableList';
import {Invoice, File} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import InvoicePaymentForm from '../InvoicePaymentForm';
import {DocumentIcon} from '@heroicons/react/24/outline';

interface InvoiceTablePayments {
  invoice: Invoice;
}

const InvoiceTablePayments = ({invoice}: InvoiceTablePayments) => {
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);

  const columns = [
    {
      title: 'Descripción',
      dataIndex: 'description',
      width: 110,
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
      render: (attachments: File[]) => {
        if (attachments && attachments.length > 0) {
          return (
            <a href={attachments[0].source} target={'_blank'}>
              <DocumentIcon width={16} color={'#000'} />
            </a>
          );
        }
      },
    },
  ];
  return (
    <div>
      <TableList small columns={columns} dataSource={invoice.payments} pagination={false} />
      <PrimaryButton
        label={'Registrar nuevo pago'}
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
          }}
        />
      </Modal>
    </div>
  );
};

export default InvoiceTablePayments;
