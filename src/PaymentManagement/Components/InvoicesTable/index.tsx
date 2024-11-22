import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Divider, Empty, Input, Pagination, Select, Space, Tag} from 'antd';
import {ArrowPathIcon} from '@heroicons/react/24/outline';
import {CreditCardIcon, NoSymbolIcon} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import IconButton from '../../../CommonUI/IconButton';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import {Invoice, ResponsePagination} from '../../../Types/api';
import PersonSubscription from '../../Components/PersonSubscription';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ProfileCard from '../../../AccountManagement/Components/ProfileCard';
import TableList from '../../../CommonUI/TableList';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import InvoiceTableDetails from '../../Components/InvoiceTableDetails';
import MoneyString from '../../../CommonUI/MoneyString';

interface InvoicesProps {
  entityUuid: string;
}

const InvoicesTable = ({entityUuid}: InvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [search, setSearch] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();

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
      render: (date: string) => <>{dayjs(date).format('DD/MM/YYYY')}</>,
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
  ];

  return (
    <>
      <div>
        <TableList columns={columns} dataSource={invoices} />
        {invoices?.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay pagos registradas'} />
        )}
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
      </div>
      <div>
        {selectedInvoice && (
          <>
            <ContentHeader
              title={selectedInvoice?.concept + ' - ' + selectedInvoice?.amount_string}
              description={`S/ ${selectedInvoice?.invoiceable.amount / 100}`}>
              {selectedInvoice?.invoiceable.uuid} <br />
              <Tag color={selectedInvoice.pending_payment && selectedInvoice.pending_payment > 0 ? 'red' : 'green'}>
                Pago pendiente: <MoneyString value={selectedInvoice.pending_payment} />
              </Tag>
            </ContentHeader>
            <ProfileCard profile={selectedInvoice.customer} />
            <InvoiceTableDetails invoice={selectedInvoice} />
            <Divider>Pagos</Divider>
          </>
        )}
      </div>
    </>
  );
};

export default InvoicesTable;
