import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Pagination,
  Popconfirm,
  Row,
  Space,
} from 'antd';
import {TbInfoCircle, TbPencil, TbTrash} from "react-icons/tb";
import {Link} from "react-router-dom";
import dayjs from 'dayjs';

import type {
  Invoice,
  InvoicePayment,
  ResponsePagination,
  WalletTransaction
} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import ModuleContent from '../../../CommonUI/ModuleContent';
import TableList from '../../../CommonUI/TableList';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import MoneyString from '../../../CommonUI/MoneyString';
import FilterForm from "../../../CommonUI/FilterForm";
import Config from "../../../Config.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {ClientSelector} from "../../Components/ClientSelector";
import InvoiceForm from "../../Components/InvoiceForm";
import InvoiceTableDetails from "../../Components/InvoiceTableDetails";
import ModalView from "../../../CommonUI/ModalView";
import InvoicePaymentForm from "../../Components/InvoicePaymentForm";

const PaymentsManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [search, setSearch] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [dateRangeFilter, setDateRangeFilter] = useState<any[] | null>();
  const [dateCreatedRangeFilter, setDateCreatedRangeFilter] = useState<any[] | null>();
  const [openPaymentsDetail, setOpenPaymentsDetail] = useState(false);
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InvoicePayment>();
  const [loadingDeleteSelection, setLoadingDeleteSelection] = useState(false);
  const [filters, setFilters] = useState<any>();


  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        ...filters,
        page: currentPage,
        page_size: pageSize,
        date_range: dateRangeFilter ? dateRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
        create_date_range: dateCreatedRangeFilter ? dateCreatedRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
      },
    };
    setLoading(true);
    axios
      .get(`payment-management/payments`, config)
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
  }, [pageSize, search, currentPage, reload, dateRangeFilter, filters, dateCreatedRangeFilter]);

  const deletePayment = (uuid: string) => {
    axios
      .delete('payment-management/payments/' + uuid)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const deleteSelection = () => {
    setLoadingDeleteSelection(true);
    axios
      .delete('payment-management/payments/delete-selection', {
        params: {
          ...filters,
          date_range: dateRangeFilter ? dateRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
          create_date_range: dateCreatedRangeFilter ? dateCreatedRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
        }
      })
      .then(() => {
        setReload(!reload);
        setLoadingDeleteSelection(false);
      })
      .catch(error => {
        setLoadingDeleteSelection(false);
        ErrorHandler.showNotification(error);
      });
  };

  const columns: any = [
    {
      title: 'N° Voucher/Transacción',
      width: 200,
      dataIndex: 'voucher_code',
      render: (voucher_code: string, row: InvoicePayment) => {
        return (<>
          <code>{voucher_code}</code>
          <small>{row.payment_channel}</small>
        </>);
      },
    },
    {
      title: 'F. de pago',
      width: 180,
      dataIndex: 'transaction_date',
      render: (date: string, row: InvoicePayment) => <code>{date ? dayjs(date).format(Config.datetimeFormatUser) : ''}
        <small>{dayjs(row.created_at).format(Config.datetimeFormatUser)}</small>
      </code>,
    },
    {
      title: 'Cuenta',
      width: 200,
      dataIndex: 'transaction',
      render: (transaction: WalletTransaction) => {
        return <>{transaction?.wallet_to?.name}</>;
      },
    },
    {
      title: 'Descripción',
      width: 180,
      dataIndex: 'description',
    },
    {
      title: 'Req. de pago',
      dataIndex: 'invoice',
      render: (invoice: Invoice) => {
        return <Link to={'finances/invoices'}>{invoice.tracking_id}</Link>;
      }
    },
    {
      title: 'Info',
      dataIndex: 'transaction_info',
      render: (transaction_info?: string) => {
        try {
          return transaction_info ? JSON.parse(transaction_info).invoice_document : null;
        } catch (e) {
          return null;
        }
      }
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      align: 'right',
      render: (amount: number, row: Invoice) => {
        return <>
          <MoneyString currency={row?.currency || 'PEN'} value={amount}/>
        </>;
      }
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 75,
      render: (uuid: string, row: InvoicePayment) => (
        <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedPayment(row);
            setOpenPaymentsDetail(true);
          }}/>
          <Popconfirm
            title={'¿Quiere eliminar esta factura?'}
            onConfirm={() => deletePayment(uuid)}
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
          tools={<>
            <div>
              Total {pagination?.total}
            </div>
            <Popconfirm
              title={'¿Seguro que quieres borrar esta selección?'} description={<>
              Se eliminarán todos los {pagination?.total} pagos que están afectadas por el filtro actual
            </>}
              onConfirm={deleteSelection}
            >
              <PrimaryButton
                loading={loadingDeleteSelection}
                icon={<TbInfoCircle/>} label={'Borrar selección'} size={"small"} danger ghost/>
            </Popconfirm>
          </>}>
          <FilterForm
            onInitialValues={values => setFilters(values)}
            onSubmit={values => setFilters(values)}
            additionalChildren={<>
              <Form.Item label={'Fecha de creación'}>
                <DatePicker.RangePicker
                  showNow format={'DD/MM/YYYY'}
                  onChange={value => setDateCreatedRangeFilter(value)}/>
              </Form.Item>
            </>}
          >
            <Form.Item name={'voucher_code'} label={'N°'}>
              <Input allowClear placeholder={'N° Voucher/Transacción'}/>
            </Form.Item>
            <Form.Item name={'client_uuid'}>
              <ClientSelector placeholder={'Filtrar por cliente'}/>
            </Form.Item>
            <Form.Item label={'Fecha de pago'}>
              <DatePicker.RangePicker showNow format={'DD/MM/YYYY'} onChange={value => setDateRangeFilter(value)}/>
            </Form.Item>
            <Form.Item label={'Monto'} name={'amount'}>
              <InputNumber/>
            </Form.Item>
          </FilterForm>
        </ContentHeader>
        <TableList scroll={{x: 1000}} customStyle={false} columns={columns} dataSource={invoices}/>
        <Pagination
          style={{marginTop: 10}}
          align={'center'}
          total={pagination?.total}
          pageSize={pagination?.per_page}
          current={pagination?.current_page}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </ModuleContent>
      <ModalView
        width={1000}
        open={openInvoiceForm}
        onCancel={() => {
          setSelectedInvoice(undefined);
          setOpenInvoiceForm(false)
        }}>
        <Row gutter={[20, 20]}>
          <Col span={10}>
            <InvoiceForm
              invoice={selectedInvoice}
              onComplete={(invoice) => {
                setReload(!reload);
                setSelectedInvoice(invoice);
              }}/>
          </Col>
          <Col span={14}>
            {!selectedInvoice && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={'Guarda la solicitud de pago para poder agregar los items'}/>}
            {selectedInvoice &&
              <InvoiceTableDetails
                onChange={() => {
                  setReload(!reload);
                }}
                invoice={selectedInvoice}/>
            }
          </Col>
        </Row>
      </ModalView>
      <ModalView
        width={700}
        onCancel={() => {
          setOpenPaymentsDetail(false);
        }} open={openPaymentsDetail}>
        {selectedPayment?.invoice &&
          <InvoicePaymentForm
            invoice={selectedPayment.invoice}
            payment={selectedPayment}
            onCompleted={() => {
              setOpenInvoiceForm(false);
              setReload(!reload);
              setOpenPaymentsDetail(false);
              setSelectedInvoice(undefined);
            }}
          />
        }

      </ModalView>
    </>
  );
};

export default PaymentsManager;
