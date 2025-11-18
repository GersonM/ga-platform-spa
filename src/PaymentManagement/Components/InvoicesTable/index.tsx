import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Col, Empty, Pagination, Popconfirm, Row, Space, Tag, Tooltip} from 'antd';
import {PiPlusBold} from 'react-icons/pi';
import {TbCoins, TbPencil, TbRefresh, TbTrash} from 'react-icons/tb';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import type {Client, Contract, Invoice, InvoiceItem, ResponsePagination} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import InvoiceTableDetails from '../../Components/InvoiceTableDetails';
import MoneyString from '../../../CommonUI/MoneyString';
import InvoiceTablePayments from '../InvoiceTablePayments';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ModalView from "../../../CommonUI/ModalView";
import InvoiceForm from "../InvoiceForm";
import logoSunat from "../../../Assets/sunat_icon.png";

interface InvoicesProps {
  order?: string;
  refresh?: boolean;
  allowCreate?: boolean;
  contract: Contract;
  client?: Client;
  tools?: React.ReactNode;
  showActions?: boolean;
}

const InvoicesTable = (
  {
    client,
    contract,
    order = 'older',
    tools,
    refresh,
    showActions = true,
    allowCreate = true,
  }: InvoicesProps) => {
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
    setReload(!reload);
  }, [refresh]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        page: currentPage, page_size: pageSize, contract_uuid: contract.uuid,
        order
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
      title: 'Monto',
      dataIndex: 'amount',
      align: 'right',
      render: (amount: number, row: Invoice) => {
        return <>
          <MoneyString currency={row?.currency || 'PEN'} value={amount}/>
          <small> {row.apply_taxes ? 'Incluye IGV' : ''} | Pendiente: <MoneyString currency={row?.currency || 'PEN'} value={row?.pending_payment}/></small>
        </>;
      }
    },
    {
      title: 'F. emisión',
      width: 100,
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
  ];

  if (showActions) {
    columns.push({
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
          <IconButton
            disabled title={'Documentos SUNAT'} small
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
    },);
  }

  return (
    <>
      {invoices?.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay pagos registrados'}/>
      ) : (
        <TableList loading={loading} columns={columns} dataSource={invoices}/>
      )}
      {client &&
        <Space style={{marginTop: 10}}>
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
          <IconButton title={'Recargar lista de pagos'} icon={<TbRefresh/>} onClick={() => setReload(!reload)}/>
          {allowCreate &&
            <PrimaryButton
              size={'small'}
              ghost
              label={'Crear requerimiento de pago'}
              onClick={() => setOpenInvoiceForm(true)}
              icon={<PiPlusBold/>}
            />}
          {tools}
        </Space>
      }
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
              contractUuid={contract.uuid}
              clientUuid={client?.uuid}
              onComplete={(invoice) => {
                setReload(!reload);
                setSelectedInvoice(invoice);
              }}/>
          </Col>
          <Col span={14}>
            {!selectedInvoice && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={'Guarda la solicitud de pago para poder agregar los items'}/>}
            {client && selectedInvoice &&
              <InvoiceTableDetails
                invoice={selectedInvoice}
                onChange={() => {
                  setReload(!reload);
                }}
              />
            }
          </Col>
        </Row>
      </ModalView>
    </>
  );
};

export default InvoicesTable;
