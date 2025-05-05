import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Divider, Empty, Modal, Pagination, Space, Tag} from 'antd';
import {ArrowPathIcon} from '@heroicons/react/24/outline';
import {PiPencilSimple, PiPlusBold} from 'react-icons/pi';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import {Invoice, ResponsePagination} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import InvoiceTableDetails from '../../Components/InvoiceTableDetails';
import MoneyString from '../../../CommonUI/MoneyString';
import InvoiceTablePayments from '../InvoiceTablePayments';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface InvoicesProps {
  entityUuid: string;
  type: string;
}

const InvoicesTable = ({entityUuid, type}: InvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [search, setSearch] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [openNewInvoice, setOpenNewInvoice] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, page_size: pageSize, invoiceable_uuid: entityUuid},
    };
    setLoading(true);
    axios
      .get(`payment-management/invoices`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setInvoices(response.data.data);
          setPagination(response.data.meta);
          if (selectedInvoice) {
            setSelectedInvoice(response.data.data.find((i: any) => i.uuid === selectedInvoice.uuid));
          }
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [pageSize, search, currentPage, reload]);

  const columns = [
    {
      title: 'Concepto',
      dataIndex: 'concept',
    },
    {
      title: 'Monto',
      dataIndex: 'amount_string',
    },
    {
      title: 'Creado',
      dataIndex: 'issued_on',
      render: (date: string) => <>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</>,
    },
    {
      title: 'Estado',
      width: 100,
      dataIndex: 'pending_payment',
      render: (pending_payment: number) => (
        <Tag color={pending_payment && pending_payment > 0 ? 'red' : 'green'}>
          {pending_payment > 0 ? (
            <>
              <MoneyString value={pending_payment} />
            </>
          ) : (
            'Pagado'
          )}
        </Tag>
      ),
    },
    {
      title: '',
      dataIndex: 'uuid',
      render: (uuid: string, row: Invoice) => (
        <IconButton icon={<PiPencilSimple size={18} />} onClick={() => setSelectedInvoice(row)} />
      ),
    },
  ];

  return (
    <>
      <div>
        {invoices?.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay pagos registrados'} />
        ) : (
          <>
            <TableList columns={columns} dataSource={invoices} />
            <Space>
              <Pagination
                showSizeChanger={false}
                size={'small'}
                total={pagination?.total}
                pageSize={pagination?.per_page}
                current={pagination?.current_page}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
              <IconButton icon={<ArrowPathIcon />} onClick={() => setReload(!reload)} />
            </Space>
          </>
        )}
        <PrimaryButton
          size={'small'}
          ghost
          label={'Agregar factura'}
          onClick={() => setOpenNewInvoice(true)}
          icon={<PiPlusBold size={16} />}
        />
      </div>
      <Modal open={!!selectedInvoice} destroyOnClose footer={false} onCancel={() => setSelectedInvoice(undefined)}>
        {selectedInvoice && (
          <>
            <h3>{selectedInvoice?.concept + ' - ' + selectedInvoice?.amount_string}</h3>
            <Tag color={selectedInvoice.pending_payment && selectedInvoice.pending_payment > 0 ? 'red' : 'green'}>
              Pago pendiente: <MoneyString value={selectedInvoice.pending_payment} />
            </Tag>
            <InvoiceTableDetails invoice={selectedInvoice} invoiceOwnerUuid={entityUuid} invoiceOwnerType={type} />
            <Divider>Pagos</Divider>
            <InvoiceTablePayments invoice={selectedInvoice} onChange={() => setReload(!reload)} />
          </>
        )}
      </Modal>
      <Modal
        open={openNewInvoice}
        destroyOnClose
        footer={false}
        title={'Agregar factura'}
        onCancel={() => setOpenNewInvoice(false)}
        onOk={() => setOpenNewInvoice(true)}>
        <InvoiceTableDetails invoice={selectedInvoice} invoiceOwnerUuid={entityUuid} invoiceOwnerType={type} />
      </Modal>
    </>
  );
};

export default InvoicesTable;
