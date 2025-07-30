import {useEffect, useState} from 'react';
import axios from 'axios';
import {DatePicker, Divider, Empty, Form, Input, Pagination, Popconfirm, Select, Space, Tag, Tooltip} from 'antd';
import {ArrowPathIcon} from '@heroicons/react/24/outline';
import {CreditCardIcon, NoSymbolIcon} from '@heroicons/react/24/solid';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import IconButton from '../../../CommonUI/IconButton';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import type {Client, Invoice, InvoiceItem, ResponsePagination} from '../../../Types/api';
import PersonSubscription from '../../Components/PersonSubscription';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ProfileCard from '../../../AccountManagement/Components/ProfileCard';
import TableList from '../../../CommonUI/TableList';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import InvoiceTableDetails from '../../Components/InvoiceTableDetails';
import MoneyString from '../../../CommonUI/MoneyString';
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import FilterForm from "../../../CommonUI/FilterForm";
import {PiPencilSimple} from "react-icons/pi";
import {TbCashRegister, TbTrash} from "react-icons/tb";

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
  const [dateRangeFilter, setDateRangeFilter] = useState<any[] | null>();
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
  const [openPaymentsDetail, setOpenPaymentsDetail] = useState(false);


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

  const deleteInvoice = (uuid: string) => {
    axios
      .delete('payment-management/invoices/' + uuid)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const columns: any = [
    {
      title: 'N°',
      width: 40,
      dataIndex: 'tracking_id',
      render: (tracking_id: string) => <code>{tracking_id}</code>,
    },
    {
      title: 'Descripción',
      dataIndex: 'concept',
      render: (concept: string, row: Invoice) => {
        return concept || row.items?.map((i: InvoiceItem) => i.concept).join(', ');
      }
    },
    {
      title: 'Cliente',
      dataIndex: 'customer',
      render: (customer: Client, invoice: Invoice) => {
        return <>
          {invoice.customer_type}
        </>;
      }
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      align: 'right',
      render: (amount: number, row: Invoice) => {
        return <>
          <MoneyString currency={row?.currency || 'PEN'} value={amount}/>
          <small>Pendiente: <MoneyString currency={row?.currency || 'PEN'} value={row?.pending_payment}/></small>
        </>;
      }
    },
    {
      title: 'Creado',
      width: 100,
      dataIndex: 'issued_on',
      render: (date: string) => <>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</>,
    },
    {
      title: 'Expira',
      width: 100,
      dataIndex: 'expires_on',
      render: (date: string) => <>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</>,
    },
    {
      title: 'Estado',
      width: 100,
      dataIndex: 'pending_payment',
      render: (pending_payment: number, i: Invoice) => {
        if (i.paid_at) {
          return <Tag color={'green'}>Pagado</Tag>;
        }
        if (i.expires_on) {
          const isExpired = dayjs(i.expires_on).isAfter(new Date());
          return (
            <Tooltip title={'Fecha de vencimiento: ' + dayjs(i.expires_on).format('DD/MM/YYYY')}>
              <Tag color={isExpired ? 'orange' : 'red'}>
                {isExpired ? 'Vence en' : 'Venció'} {dayjs(i.expires_on).fromNow()}
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tag color={i.paid_at ? 'green' : 'red'}>
            {pending_payment > 0 ? (
              <>
                <MoneyString value={pending_payment}/>
              </>
            ) : (
              'Pagado'
            )}
          </Tag>
        );
      },
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 75,
      render: (uuid: string, row: Invoice) => (
        <Space>
          <IconButton small icon={<PiPencilSimple/>} onClick={() => {
            setSelectedInvoice(row);
            setOpenInvoiceForm(true);
          }}/>
          <IconButton title={'Abrir ventana de pagos'} small icon={<TbCashRegister/>} onClick={() => {
            setSelectedInvoice(row);
            setOpenPaymentsDetail(true);
          }}/>
          <Popconfirm
            title={'¿Quiere eliminar esta factura?'}
            onConfirm={() => deleteInvoice(uuid)}
            okText={'Si'}
            cancelText={'No'}>
            <IconButton small danger icon={<TbTrash/>}/>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <>
      <ModuleContent>
        <ContentHeader
          title={'Pagos'}
          loading={loading}
          onRefresh={() => setReload(!reload)}
          tools={`Total ${pagination?.total}`}/>
        <FilterForm>
          <Form.Item name={'Nombre'}>
            <DatePicker.RangePicker format={'DD/MM/YYYY'} onChange={value => setDateRangeFilter(value)}/>
          </Form.Item>
          <Form.Item>
            <Select options={[
              {label:'Pagados', value:''},
              {label:'Ver todo', value:''},
            ]}/>
          </Form.Item>
          <Form.Item>
            <Input.Search
              allowClear
              placeholder={'Voucher'}
              onSearch={value => {
                setSearch(value);
                setCurrentPage(1);
              }}
            />
          </Form.Item>
        </FilterForm>
        <TableList columns={columns} dataSource={invoices}/>
        <Pagination
          align={'center'}
          showSizeChanger={false}
          total={pagination?.total}
          pageSize={pagination?.per_page}
          current={pagination?.current_page}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
        {selectedInvoice && (
          <>
            <ContentHeader
              title={selectedInvoice?.concept + ' - ' + selectedInvoice?.amount_string}
              description={`S/ ${selectedInvoice?.invoiceable.amount / 100}`}>
              {selectedInvoice?.invoiceable.uuid} <br/>
              <Tag color={selectedInvoice.pending_payment && selectedInvoice.pending_payment > 0 ? 'red' : 'green'}>
                Pago pendiente: <MoneyString value={selectedInvoice.pending_payment}/>
              </Tag>
            </ContentHeader>
            {selectedInvoice.customer_type?.includes('profile') ?
              <CompanyChip company={selectedInvoice?.customer}/> :
              <ProfileCard profile={selectedInvoice?.customer}/>
            }
            <InvoiceTableDetails invoice={selectedInvoice} invoiceOwnerUuid={'234'} invoiceOwnerType={'person'}/>
            <Divider>Pagos</Divider>
            <TableList columns={columns} dataSource={selectedInvoice.payments}/>
            <Divider>Otras subscripciones</Divider>
            <PersonSubscription profileUuid={selectedInvoice.invoiceable_id}/>
          </>
        )}
      </ModuleContent>
    </>
  );
};

export default Invoices;
