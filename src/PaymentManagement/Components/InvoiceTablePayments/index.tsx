import React from 'react';

import TableList from '../../../CommonUI/TableList';
import {Invoice} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface InvoiceTablePayments {
  invoice: Invoice;
}

const InvoiceTablePayments = ({invoice}: InvoiceTablePayments) => {
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
      <PrimaryButton label={'Registrar nuevo pago'} block ghost size={'small'} />
    </div>
  );
};

export default InvoiceTablePayments;
