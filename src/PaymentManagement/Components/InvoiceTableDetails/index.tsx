import {useState} from 'react';
import {Modal, Popconfirm, Space, Tag} from 'antd';
import dayjs, {type Dayjs} from "dayjs";
import {TbPlus} from "react-icons/tb";
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import type {Invoice, InvoiceItem} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import InvoiceItemForm from '../InvoiceItemForm';
import {PiPencilSimple, PiTrash} from 'react-icons/pi';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";

interface InvoiceTableDetailsProps {
  invoice?: Invoice;
  invoiceOwnerUuid: string;
  invoiceOwnerType: string;
  invoiceableUuid?: string;
  invoiceableType?: string;
  onChange?: () => void;
}

const InvoiceTableDetails = (
  {
    invoice,
    onChange,
    invoiceableType,
    invoiceableUuid,
    invoiceOwnerUuid,
    invoiceOwnerType
  }: InvoiceTableDetailsProps) => {
  const [openInvoiceItemForm, setOpenInvoiceItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem>();
  const [expirationDate, setExpirationDate] = useState<Dayjs>();

  const removeConcept = (uuid: string) => {
    console.log(uuid);
    axios
      .delete('payment-management/invoice-items/' + uuid)
      .then(() => {
        if (onChange) {
          onChange();
        }
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
      render: (value: number) => <MoneyString value={value}/>,
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
      render: (uuid: string, item: InvoiceItem) => {
        return (
          <Space>
            <IconButton icon={<PiPencilSimple size={18}/>} small onClick={() => {
              setOpenInvoiceItemForm(true);
              setSelectedItem(item);
            }}/>
            <Popconfirm title={'¿Quieres eliminar este item?'} onConfirm={() => removeConcept(uuid)}>
              <IconButton icon={<PiTrash size={18}/>} small danger/>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <TableList columns={columns} dataSource={invoice?.items}/>
      <PrimaryButton
        icon={<TbPlus/>}
        style={{marginTop: '10px'}}
        label={'Agregar item'}
        block
        onClick={() => setOpenInvoiceItemForm(true)}
      />
      <ActivityLogViewer entity={'invoice'} id={invoice?.uuid}/>
      <Modal
        open={openInvoiceItemForm}
        destroyOnHidden
        footer={null}
        title={'Agregar item'}
        onCancel={() => {
          setOpenInvoiceItemForm(false);
          setSelectedItem(undefined);
        }}>
        <InvoiceItemForm
          onCompleted={() => {
            setSelectedItem(undefined);
            setOpenInvoiceItemForm(false);
            if (onChange) {
              onChange();
            }
          }}
          expiresOn={expirationDate}
          invoiceItem={selectedItem}
          invoiceUuid={invoice?.uuid}
          invoiceOwnerUuid={invoiceOwnerUuid}
          invoiceOwnerType={invoiceOwnerType}
          invoiceableUuid={invoiceableUuid}
          invoiceableType={invoiceableType}
        />
      </Modal>
    </div>
  );
};

export default InvoiceTableDetails;
