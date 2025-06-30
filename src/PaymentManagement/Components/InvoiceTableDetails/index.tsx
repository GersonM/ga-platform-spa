import {useState} from 'react';
import {
  Col,
  DatePicker,
  Descriptions,
  type DescriptionsProps,
  Divider,
  Form,
  Modal,
  Popconfirm,
  Row,
  Space, Tag
} from 'antd';
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import type {Invoice, InvoiceItem} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import InvoiceItemForm from '../InvoiceItemForm';
import {PiPencilSimple, PiPlus, PiTrash} from 'react-icons/pi';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import dayjs, {type Dayjs} from "dayjs";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";

interface InvoiceTableDetailsProps {
  invoice?: Invoice;
  invoiceOwnerUuid: string;
  invoiceOwnerType: string;
  invoiceableUuid?: string;
  invoiceableType?: string;
  onChange?: () => void;
}

const InvoiceTableDetails = ({
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

  const invoicesItems: DescriptionsProps['items'] = [
    {key: '1', label: 'Vencimiento', children: <DatePicker onChange={(d) => setExpirationDate(d)} value={expirationDate} defaultValue={dayjs(invoice?.expires_on)}/>},
    {key: 'total', label: 'Total', children: <MoneyString value={invoice?.amount}/>},
    {
      key: 'pending', label: 'Pendiente', children: <>
        {invoice?.pending_payment && (invoice?.pending_payment != 0 ?
          <Tag color={'orange'}><MoneyString value={invoice?.pending_payment}/></Tag> :
          <Tag color={'green'}>Pagado</Tag>
        )}
      </>
    },
  ];
  return (
    <div>
      <Descriptions layout={"vertical"} size={"small"} items={invoicesItems}/>
      <TableList small columns={columns} dataSource={invoice?.items} pagination={false}/>
      <ActivityLogViewer entity={'invoice'} id={invoice?.uuid}/>
      <PrimaryButton
        size={'small'}
        icon={<PiPlus size={16}/>}
        style={{marginTop: '10px'}}
        label={'Agregar item'}
        ghost
        block
        onClick={() => setOpenInvoiceItemForm(true)}
      />
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
