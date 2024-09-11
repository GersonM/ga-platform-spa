import React from 'react';
import TableList from '../../../CommonUI/TableList';
import {Invoice} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';

interface InvoiceTableDetailsProps {
  invoice: Invoice;
}

const InvoiceTableDetails = ({invoice}: InvoiceTableDetailsProps) => {
  const columns = [
    {
      title: 'Concepto',
      dataIndex: 'concept',
      width: 110,
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      width: 110,
      render: (value: number) => <MoneyString value={value} />,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      width: 110,
    },
  ];
  return (
    <div>
      <TableList small columns={columns} dataSource={invoice.items} pagination={false} />
    </div>
  );
};

export default InvoiceTableDetails;
