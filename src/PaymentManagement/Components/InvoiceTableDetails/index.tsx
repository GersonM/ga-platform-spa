import {useEffect, useState} from 'react';
import {Button, Modal, Popconfirm, Select, Space} from 'antd';
import {PiPencilSimple, PiTrash} from 'react-icons/pi';
import {TbPlus} from "react-icons/tb";
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import type {Invoice, InvoiceItem} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import InvoiceItemForm from '../InvoiceItemForm';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ModalView from "../../../CommonUI/ModalView";

interface InvoiceTableDetailsProps {
  invoice: Invoice;
  onChange?: () => void;
}

const InvoiceTableDetails = ({invoice, onChange}: InvoiceTableDetailsProps) => {
  const [openInvoiceItemForm, setOpenInvoiceItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [fullInvoiceData, setFullInvoiceData] = useState<Invoice>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`payment-management/invoices/${invoice.uuid}`, config)
      .then(response => {
        if (response) {
          setFullInvoiceData(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, invoice]);

  const removeConcept = (uuid: string) => {
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
      title: 'Cant.',
      align: 'center',
      dataIndex: 'quantity',
      width: 60,
    },
    {
      title: 'Concepto',
      dataIndex: 'concept',
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      align: 'right',
      width: 110,
      render: (value: number, row: InvoiceItem) => <MoneyString currency={invoice?.currency}
                                                                value={value * row.quantity}/>,
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

  console.log(fullInvoiceData?.contract)
  return (
    <div>
      <TableList columns={columns} dataSource={invoice?.items}/>
      {fullInvoiceData?.contract?.cart?.map((item, index) => {
        return (<Button size={"small"} key={index} onClick={() => {}}>Agregar: {item.stock?.full_name} x{item.quantity}</Button>)
      })}

      <PrimaryButton
        icon={<TbPlus/>}
        style={{marginTop: '10px'}}
        label={'Añadir nuevo item'}
        onClick={() => setOpenInvoiceItemForm(true)}
      />
      <ModalView
        open={openInvoiceItemForm}
        width={700}
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
          invoiceItem={selectedItem}
          invoice={invoice}
        />
      </ModalView>
    </div>
  );
};

export default InvoiceTableDetails;
