import {useEffect, useState} from 'react';
import axios from 'axios';
import {Col, Empty, Pagination, Popconfirm, Row, Space, Tag, Tooltip} from 'antd';
import {PiPencilSimple, PiPlusBold} from 'react-icons/pi';
import {TbCash, TbCashRegister, TbReload, TbTrash} from 'react-icons/tb';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import type {Company, Invoice, InvoiceItem, Profile, ResponsePagination} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import InvoiceTableDetails from '../../Components/InvoiceTableDetails';
import MoneyString from '../../../CommonUI/MoneyString';
import InvoiceTablePayments from '../InvoiceTablePayments';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ModalView from "../../../CommonUI/ModalView";
import InvoiceForm from "../InvoiceForm";

interface InvoicesProps {
  entityUuid: string;
  type: string;
  customer?: Profile | Company;
  customerType?: string;
}

const InvoicesTable = ({entityUuid, type, customer, customerType = 'profile'}: InvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [search] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false);
  const [openPaymentsDetail, setOpenPaymentsDetail] = useState(false);

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

  const columns = [
    {
      title: 'N°',
      width: 40,
      dataIndex: 'tracking_id',
    },
    {
      title: 'Descripción',
      dataIndex: 'concept',
      render: (concept: string, row: Invoice) => {
        return concept || row.items?.map((i: InvoiceItem) => i.concept).join(', ');
      }
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      render: (amount: number, row: Invoice) => {
        return <>
          <MoneyString currency={row?.currency || 'PEN'} value={amount}/>
          <small>Pendiente: <MoneyString currency={row?.currency || 'PEN'} value={row?.pending_payment}/></small>
        </>;
      }
    },
    {
      title: 'Creado',
      width: 110,
      dataIndex: 'issued_on',
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
    },
  ];

  return (
    <>
      {invoices?.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay pagos registrados'}/>
      ) : (
        <>
          <TableList loading={loading} columns={columns} dataSource={invoices}/>
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
            <IconButton icon={<TbReload/>} onClick={() => setReload(!reload)}/>
          </Space>
        </>
      )}
      {customer &&
        <PrimaryButton
          size={'small'}
          ghost
          label={'Agregar solicitud de pago'}
          onClick={() => setOpenInvoiceForm(true)}
          icon={<PiPlusBold/>}
        />
      }
      <ModalView
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
      <ModalView
        width={1000}
        title={selectedInvoice ? 'Detalle de solicitud de pago':'Nueva solicitud de pago'}
        open={openInvoiceForm}
        onCancel={() => {
          setSelectedInvoice(undefined);
          setOpenInvoiceForm(false)
        }}>
        <Row gutter={[20, 20]}>
          <Col span={10}>
            <InvoiceForm
              invoice={selectedInvoice}
              customerType={customerType}
              invoiceableUuid={entityUuid}
              invoiceableType={type}
              customerUuid={customer?.uuid}
              onComplete={(invoice) => {
                setReload(!reload);
                setSelectedInvoice(invoice);
              }}/>
          </Col>
          <Col span={14}>
            {!selectedInvoice && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={'Guarda la solicitud de pago para poder agregar los items'}/>}
            {customer && selectedInvoice &&
              <InvoiceTableDetails
                invoiceableUuid={entityUuid}
                invoiceableType={type}
                onChange={() => {
                  //setOpenInvoiceForm(false);
                  setReload(!reload);
                }}
                invoice={selectedInvoice}
                invoiceOwnerUuid={customer?.uuid}
                invoiceOwnerType={customerType}
              />
            }
          </Col>
        </Row>
      </ModalView>
    </>
  );
};

export default InvoicesTable;
