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
  Select,
  Space,
  Tooltip
} from 'antd';
import {TbCoins, TbPencil, TbTrash} from "react-icons/tb";
import {Link} from "react-router-dom";
import dayjs from 'dayjs';

import logoSunat from '../../../Assets/sunat_icon.png';
import type {Client, Contract, Invoice, InvoiceItem, ResponsePagination} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import ModuleContent from '../../../CommonUI/ModuleContent';
import TableList from '../../../CommonUI/TableList';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import MoneyString from '../../../CommonUI/MoneyString';
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import FilterForm from "../../../CommonUI/FilterForm";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import CustomTag from "../../../CommonUI/CustomTag";
import Config from "../../../Config.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {ClientSelector} from "../../Components/ClientSelector";
import InvoiceForm from "../../Components/InvoiceForm";
import InvoiceTableDetails from "../../Components/InvoiceTableDetails";
import ModalView from "../../../CommonUI/ModalView";
import InvoiceTablePayments from "../../Components/InvoiceTablePayments";

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [search, setSearch] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [dateRangeFilter, setDateRangeFilter] = useState<any[] | null>();
  const [dateRangeFilterExpire, setDateRangeFilterExpire] = useState<any[] | null>();
  const [openPaymentsDetail, setOpenPaymentsDetail] = useState(false);
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
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
        expired_date_range: dateRangeFilterExpire ? dateRangeFilterExpire.map(d => d.format(Config.dateFormatServer)) : null,
      },
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
  }, [pageSize, search, currentPage, reload, dateRangeFilterExpire, filters]);

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
      width: 95,
      align: 'center',
      dataIndex: 'pending_payment',
      render: (pending_payment: number, i: Invoice) => {
        let status = null;
        if (i.expires_on) {
          const isExpired = dayjs(i.expires_on).isAfter(new Date());
          status = (
            <CustomTag color={isExpired ? 'orange' : 'red'}>
              {isExpired ? 'Por cobrar' : 'Vencido'}
            </CustomTag>
          );
        }
        if (i.paid_at) {
          status = <CustomTag color={'green'}>Pagado</CustomTag>;
        }
        return (<>
          <code>{i.tracking_id}</code><br/>
          {status ||
            <CustomTag color={i.paid_at ? 'green' : 'red'}>
              {pending_payment > 0 ? 'Pendiente' : 'Pagado'}
            </CustomTag>
          }
        </>);
      },
    },
    {
      title: 'F. emisión',
      width: 110,
      dataIndex: 'issued_on',
      render: (date: string) => <code>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</code>,
    },
    {
      title: 'Vencimiento',
      width: 110,
      dataIndex: 'expires_on',
      render: (date: string) => <>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</>,
    },
    {
      title: 'Concepto',
      dataIndex: 'items',
      render: (items: InvoiceItem[]) => {
        return items?.map((i: InvoiceItem) => i.concept).join(', ');
      }
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      render: (client?: Client) => {
        return client?.type.includes('Profile') ?
          <ProfileChip profile={client?.entity}/> :
          <CompanyChip company={client?.entity}/>;
      }
    },
    {
      title: 'Contrato',
      align: 'center',
      dataIndex: 'contract',
      render: (contract?: Contract) => {
        return contract && <Tooltip title={contract.title + ' - ' + contract.status}>
          <Link target="_blank" to={`/commercial/contracts/${contract?.uuid}`}>
            <code>{contract.tracking_id}</code>
            <small>{contract.title}</small>
          </Link>
        </Tooltip>
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
      title: 'Documentos tributarios',
      dataIndex: 'documents',
      align: 'right',
      render: (documents: any, row: Invoice) => {
        return <>
          <PrimaryButton disabled label={'Generar'} shape={'round'} ghost size={"small"}/>
        </>;
      }
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 75,
      render: (uuid: string, row: Invoice) => (
        <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedInvoice(row);
            setOpenInvoiceForm(true);
          }}/>
          <IconButton title={'Abrir ventana de pagos'} small icon={<TbCoins/>} onClick={() => {
            setSelectedInvoice(row);
            setOpenPaymentsDetail(true);
          }}/>
          <IconButton disabled title={'Documentos SUNAT'} small
                      icon={<img style={{width: 18}} src={logoSunat} alt={'Sunat'}/>} onClick={() => {
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
          title={'Requerimientos de pago'}
          loading={loading}
          onRefresh={() => setReload(!reload)}
          tools={`Total ${pagination?.total}`}>
          <FilterForm
            additionalChildren={<>
              <Form.Item label={'Emisión'} layout={'vertical'}>
                <DatePicker.RangePicker showNow format={'DD/MM/YYYY'} onChange={value => setDateRangeFilter(value)}/>
              </Form.Item>
              <Form.Item label={'Vencimiento'} layout={'vertical'}>
                <DatePicker.RangePicker showNow format={'DD/MM/YYYY'} onChange={value => setDateRangeFilterExpire(value)}/>
              </Form.Item>
            </>}
            onSubmit={values => setFilters(values)}>
            <Form.Item label={'Cliente'} name={'client_uuid'}>
              <ClientSelector/>
            </Form.Item>
            <Form.Item label={'Estado'} name={'status'}>
              <Select popupMatchSelectWidth={false} allowClear placeholder={'Todo'} options={[
                {label: 'Vencidos', value: 'expired'},
                {label: 'Pagados', value: 'paid'},
                {label: 'Pendientes', value: 'pending'},
              ]}/>
            </Form.Item>
            <Form.Item name={'voucher_code'}>
              <Input allowClear placeholder={'Voucher / ID Transacción'}/>
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
        {selectedInvoice && (
          <>
            <h3>Pagos</h3>
            <InvoiceTablePayments invoice={selectedInvoice} onChange={() => setReload(!reload)}/>
          </>
        )}
      </ModalView>
    </>
  );
};

export default Invoices;
