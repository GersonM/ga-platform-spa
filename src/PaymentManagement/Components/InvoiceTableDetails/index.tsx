import React, {useState} from 'react';
import {TrashIcon} from '@heroicons/react/24/outline';
import {Col, Modal, Popconfirm, Row, Space} from 'antd';
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import {Invoice, InvoiceItem} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import InvoiceItemForm from '../InvoiceItemForm';
import {PiPencil, PiPencilSimple, PiPlus, PiTrash} from 'react-icons/pi';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface InvoiceTableDetailsProps {
  invoice?: Invoice;
  invoiceOwnerUuid: string;
  invoiceOwnerType: string;
  onChange?: () => void;
}

const InvoiceTableDetails = ({invoice, onChange, invoiceOwnerUuid, invoiceOwnerType}: InvoiceTableDetailsProps) => {
  const [openInvoiceItemForm, setOpenInvoiceItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem>();

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
      width: 75,
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 50,
      render: (uuid: string) => {
        return (
          <Space>
            <IconButton icon={<PiPencilSimple size={18} />} small />
            <Popconfirm title={'¿Quieres eliminar este item?'} onConfirm={() => removeConcept(uuid)}>
              <IconButton icon={<PiTrash size={18} />} small danger />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <div>
      <TableList small columns={columns} dataSource={invoice?.items} pagination={false} />
      <PrimaryButton
        size={'small'}
        icon={<PiPlus size={16} />}
        style={{marginTop: '10px'}}
        label={'Agregar item'}
        ghost
        block
        onClick={() => setOpenInvoiceItemForm(true)}
      />
      <Row gutter={[20, 20]}>
        <Col>
          <div>
            Total: <MoneyString value={invoice?.amount} /> <br />
            Saldo: <MoneyString value={invoice?.pending_payment} />
          </div>
        </Col>
        <Col></Col>
      </Row>

      <Modal
        open={openInvoiceItemForm}
        footer={null}
        title={'Agregar item'}
        onCancel={() => setOpenInvoiceItemForm(false)}>
        <InvoiceItemForm
          onCompleted={() => {
            setOpenInvoiceItemForm(false);
            onChange && onChange();
          }}
          invoiceUuid={invoice?.uuid}
          invoiceOwnerUuid={invoiceOwnerUuid}
          invoiceOwnerType={invoiceOwnerType}
        />
      </Modal>
    </div>
  );
};

export default InvoiceTableDetails;
