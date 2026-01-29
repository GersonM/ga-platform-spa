import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Col, DatePicker, Empty, Form, Input, InputNumber, Popconfirm, Row, Space, Tooltip} from 'antd';
import {TbInfoCircle, TbPencil, TbTrash} from "react-icons/tb";
import {
  PiGitForkBold,
  PiGitForkLight,
  PiGitForkThin,
  PiHandDepositDuotone,
  PiHandWithdrawDuotone,
  PiShuffle
} from "react-icons/pi";
import {Link, useParams} from "react-router-dom";
import dayjs from 'dayjs';

import type {
  ApiFile,
  Invoice,
  InvoicePayment,
  ResponsePagination, Wallet,
  WalletTransaction
} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import ModuleContent from '../../../CommonUI/ModuleContent';
import TableList from '../../../CommonUI/TableList';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import MoneyString from '../../../CommonUI/MoneyString';
import FilterForm from "../../../CommonUI/FilterForm";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {ClientSelector} from "../../Components/ClientSelector";
import InvoiceForm from "../../Components/InvoiceForm";
import InvoiceTableDetails from "../../Components/InvoiceTableDetails";
import ModalView from "../../../CommonUI/ModalView";
import InvoicePaymentForm from "../../Components/InvoicePaymentForm";
import TablePagination from "../../../CommonUI/TablePagination";
import ReportDownloader from "../../../CommonUI/ReportDownloader";
import CustomTag from "../../../CommonUI/CustomTag";
import Config from "../../../Config.tsx";
import WalletTransactionForm from "../../Components/WalletTransactionForm";
import TransactionPaymentsManager from "../../Components/TransactionPaymentsManager";
import FilePreview from "../../../CommonUI/FilePreview";

const WalletTransactionsManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [dateRangeFilter, setDateRangeFilter] = useState<any[] | null>();
  const [dateInvoiceIssue, setDateInvoiceIssue] = useState<any[] | null>();
  const [dateCreatedRangeFilter, setDateCreatedRangeFilter] = useState<any[] | null>();
  const [openTransactionForm, setOpenTransactionForm] = useState(false);
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction>();
  const [loadingDeleteSelection, setLoadingDeleteSelection] = useState(false);
  const [filters, setFilters] = useState<any>();
  const params = useParams();
  const [openDistributionForm, setOpenDistributionForm] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        ...filters,
        page: currentPage,
        type: params.type,
        date_range: dateRangeFilter ? dateRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
        create_date_range: dateCreatedRangeFilter ? dateCreatedRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
        invoice_issue_date_range: dateInvoiceIssue ? dateInvoiceIssue.map(d => d.format(Config.dateFormatServer)) : null,
      },
    };
    setLoading(true);
    axios
      .get(`payment-management/transactions`, config)
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
  }, [currentPage, reload, dateRangeFilter, filters, dateCreatedRangeFilter, dateInvoiceIssue, params.type]);

  const deletePayment = (uuid: string) => {
    axios
      .delete('payment-management/transactions/' + uuid)
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
          invoice_issue_date_range: dateInvoiceIssue ? dateInvoiceIssue.map(d => d.format(Config.dateFormatServer)) : null,
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
      width: 50,
      dataIndex: 'type',
      render: (type: string) => {
        return (<Tooltip title={type} placement="right">
          {type == 'deposit' && <PiHandDepositDuotone size="24" color="green"/>}
          {type == 'withdraw' && <PiHandWithdrawDuotone size="24" color="red"/>}
          {type == 'transfer' && <PiShuffle size="24" color="blue"/>}
        </Tooltip>);
      },
    },
    {
      title: 'N° Voucher/Transacción',
      width: 200,
      dataIndex: 'tracking_id',
      render: (tracking_id: string, row: WalletTransaction) => {
        return (<>
          <code>{tracking_id}</code>
          <small>{row.payment_channel}</small>
        </>);
      },
    },
    {
      title: 'F. de pago',
      width: 180,
      dataIndex: 'transaction_date',
      render: (transaction_date: string, row: WalletTransaction) =>
        <code>{transaction_date ? dayjs(transaction_date).format(Config.dateFormatUser) : 'Sin fecha'}
          <small title={'Fecha de creación'}>{dayjs(row.created_at).format(Config.datetimeFormatUser)}</small>
        </code>,
    },
    {
      title: 'Origen',
      width: 200,
      dataIndex: 'wallet_from',
      render: (wallet_from: Wallet) => {
        return wallet_from && <>
          <small>{wallet_from.bank_name?.toUpperCase()} <CustomTag>{wallet_from.currency}</CustomTag></small>
          <small><code>{wallet_from.account_number}</code></small>
        </>;
      },
    },
    {
      title: 'Destino',
      width: 200,
      dataIndex: 'wallet_to',
      render: (wallet_to: Wallet) => {
        return wallet_to && <>
          <small>{wallet_to.bank_name?.toUpperCase()} <CustomTag>{wallet_to.currency}</CustomTag></small>
          <small><code>{wallet_to.account_number}</code></small>
        </>;
      },
    },
    {
      title: 'Observaciones',
      width: 180,
      dataIndex: 'observations',
    },
    {
      title: 'Usado',
      dataIndex: 'invoice_payments',
      render: (invoice_payments: InvoicePayment[]) => {
        return <>
          {invoice_payments.map((payment: InvoicePayment, index: number) => (
            <Link to={`/commercial/contracts/${payment.invoice_uuid}`} key={index}>
              <CustomTag color={'orange'}>
                <MoneyString value={payment.amount} currency={payment.exchange_currency}/>
              </CustomTag>
            </Link>
          ))}</>;
      }
    },
    {
      title: 'Info',
      width: 200,
      dataIndex: 'payment_channel',
      render: (payment_channel?: string) => {
        return <pre><small>{payment_channel}</small></pre>
      }
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      align: 'right',
      render: (amount: number, row: WalletTransaction) => {
        const cu = row.wallet_to?.currency || row.wallet_from?.currency
        return <>
          <MoneyString currency={cu || 'PEN'} value={amount}/>
        </>;
      }
    },
    {
      title: 'Doc.',
      dataIndex: 'attachments',
      width: 190,
      render: (attachments: ApiFile[]) => {
        return <Space wrap>
          {attachments?.map(f =>
            <FilePreview fileUuid={f.uuid}/>
          )}
        </Space>;
      },
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 75,
      render: (uuid: string, row: WalletTransaction) => (
        <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedTransaction(row);
            setOpenTransactionForm(true);
          }}/>
          <IconButton
            title={'Gestionar distribución'}
            small icon={<PiGitForkLight/>} onClick={() => {
            setSelectedTransaction(row);
            setOpenDistributionForm(true);
          }}/>
          <Popconfirm
            title={'¿Quiere eliminar esta transacción?'}
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
          title={params.type == 'deposit' ? 'Ingresos' : 'Salidas'}
          loading={loading}
          onAdd={() => setOpenTransactionForm(true)}
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
                icon={<TbInfoCircle size={18}/>} label={'Borrar selección'}
                size={"small"} danger/>
            </Popconfirm>
            <ReportDownloader
              url={'payment-management/payments/export'}
              fileName={'pagos'}
              params={{
                ...filters,
                date_range: dateRangeFilter ? dateRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
                create_date_range: dateCreatedRangeFilter ? dateCreatedRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
                invoice_issue_date_range: dateInvoiceIssue ? dateInvoiceIssue.map(d => d.format(Config.dateFormatServer)) : null,
              }}/>
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
              <Form.Item label={'Fecha de emisión de RP'}>
                <DatePicker.RangePicker
                  showNow format={'DD/MM/YYYY'}
                  onChange={value => setDateInvoiceIssue(value)}/>
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
        <TablePagination
          pagination={pagination}
          onChange={(page) => {
            setCurrentPage(page);
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
        onCancel={() => {
          setOpenTransactionForm(false);
          setSelectedTransaction(undefined);
        }} open={openTransactionForm}>
        <WalletTransactionForm
          transaction={selectedTransaction}
          type={params.type}
          onCompleted={() => {
            setReload(!reload);
            setOpenTransactionForm(false);
          }}
        />
      </ModalView>
      <ModalView
        width={700}
        onCancel={() => {
          setOpenDistributionForm(false);
          setSelectedTransaction(undefined);
        }} open={openDistributionForm}>
        {selectedTransaction && <TransactionPaymentsManager
          transaction={selectedTransaction}
        />}
      </ModalView>
    </>
  );
};

export default WalletTransactionsManager;
