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

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [search, setSearch] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [filterSubscription, setFilterSubscription] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, page_size: pageSize, voucher_code: search, subscription: filterSubscription},
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
      title: 'Comprobante N°',
      dataIndex: 'voucher_code',
      width: 160,
    },
    {
      title: 'Creado',
      dataIndex: 'created_at',
      width: 250,
      render: (date: string) => (
        <>
          {dayjs(date).format('DD [de] MMMM [del] YYYY [a las] hh:mm a')} <br />
        </>
      ),
    },
    {
      title: 'Transacción',
      width: 400,
      dataIndex: 'transaction_info',
      render: (transaction_info: string) => (
        <pre style={{lineBreak: 'anywhere', wordWrap: 'break-word', textWrap: 'wrap'}}>{transaction_info}</pre>
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'amount_string',
    },
    {
      title: 'Método de pago',
      dataIndex: 'fk_payment_method_uuid',
    },
  ];

  return (
    <>
      <ModuleSidebar
        loading={loading}
        title={'Pagos'}
        header={
          <Space>
            <Input.Search
              allowClear
              placeholder={'Voucher'}
              size={'small'}
              onSearch={value => {
                setSearch(value);
                setCurrentPage(1);
              }}
            />
            <Select
              allowClear
              placeholder={'Suscripción'}
              size={'small'}
              onChange={value => setFilterSubscription(value)}
              options={[
                {label: 'Con alguna subscripción', value: 'any'},
                {label: 'Con subscripción activa', value: 'active'},
                {label: 'Con subscripción terminada', value: 'terminated'},
              ]}
            />
          </Space>
        }
        statusInfo={`Total ${pagination?.total}`}
        footer={
          <>
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
        }>
        <NavList>
          {invoices?.map((p, index) => (
            <NavListItem
              onClick={() => setSelectedInvoice(p)}
              key={index}
              name={`${p.invoiceable?.plan?.name || 'Sin plan'} - ${p.invoiceable?.billing_currency || 'Money'} ${
                p.amount_string
              }`}
              caption={dayjs(p.created_at).fromNow() + (p.customer.name ? ' | ' + p.customer?.name : '')}
              icon={p.payments && p.payments.length > 0 ? <CreditCardIcon /> : <NoSymbolIcon />}
              path={`/invoices/${p.uuid}`}
            />
          ))}
        </NavList>
        {invoices?.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay personas registradas'} />
        )}
      </ModuleSidebar>
      <ModuleContent>
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
            <TableList columns={columns} dataSource={selectedInvoice.payments} />
            <Divider>Otras subscripciones</Divider>
            <PersonSubscription profileUuid={selectedInvoice.invoiceable_id} />
          </>
        )}
      </ModuleContent>
    </>
  );
};

export default Invoices;
