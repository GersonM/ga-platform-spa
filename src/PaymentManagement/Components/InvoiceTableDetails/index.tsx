import React from 'react';
import {TrashIcon} from '@heroicons/react/24/outline';
import {Modal, Popconfirm, Space} from 'antd';
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import {Invoice} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import InvoiceItemForm from '../InvoiceItemForm';

interface InvoiceTableDetailsProps {
  invoice?: Invoice;
  invoiceOwnerUuid?: string;
  invoiceOwnerType?: string;
  onChange?: () => void;
}

const InvoiceTableDetails = ({invoice, onChange, invoiceOwnerUuid, invoiceOwnerType}: InvoiceTableDetailsProps) => {
  const removeConcept = (uuid: string) => {
    console.log(uuid);
    axios
      .delete('payment-management/invoice-items/' + uuid)
      .then(response => {
        onChange && onChange();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const columns = [
    {
      title: 'Concepto',
      dataIndex: 'concept',
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
    {
      title: '',
      dataIndex: 'uuid',
      width: 50,
      render: (uuid: string) => {
        return (
          <Space>
            <Popconfirm title={'¿Quieres eliminar este concepto?'} onConfirm={() => removeConcept(uuid)}>
              <IconButton icon={<TrashIcon />} small danger />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <div>
      <TableList
        footer={() => (
          <>
            Total: <MoneyString value={invoice?.amount} /> <br />
            Saldo: <MoneyString value={invoice?.pending_payment} />
          </>
        )}
        small
        columns={columns}
        dataSource={invoice?.items}
        pagination={false}
      />
      <InvoiceItemForm
        invoiceUuid={invoice?.uuid}
        invoiceOwnerUuid={invoiceOwnerUuid}
        invoiceOwnerType={invoiceOwnerType}
      />
    </div>
  );
};

export default InvoiceTableDetails;
