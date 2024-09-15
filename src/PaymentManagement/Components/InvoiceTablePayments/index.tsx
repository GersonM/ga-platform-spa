import React, {useState} from 'react';
import {Modal} from 'antd';

import TableList from '../../../CommonUI/TableList';
import {Invoice} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import InvoicePaymentForm from '../InvoicePaymentForm';

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
      <Modal open={openInvoiceForm} onCancel={() => setOpenInvoiceForm(false)} footer={false}>
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
