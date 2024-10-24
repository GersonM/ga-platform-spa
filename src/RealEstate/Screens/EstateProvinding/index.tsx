import React, {useEffect, useState} from 'react';
import {Form, Input, Pagination, Progress, Select, Space, Statistic, Tag, Tooltip} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import {RiFileExcel2Fill} from 'react-icons/ri';
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import FilterForm from '../../../CommonUI/FilterForm';
import {Client, Contract, Invoice, Profile, ResponsePagination} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import './styles.less';
import MoneyString from '../../../CommonUI/MoneyString';
import InvoiceTableDetails from '../../../PaymentManagement/Components/InvoiceTableDetails';
import ContractFinancialBrief from '../../../Commercial/Components/ContractFinancialBrief';

const EstateProviding = () => {
  const [clients, setClients] = useState<Profile[]>();
  const [searchText, setSearchText] = useState<string>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commercialStats, setCommercialStats] = useState<any>();
  const [stageFilter, setStageFilter] = useState<string>();
  const [blockFilter, setBlockFilter] = useState<string>();
  const [providedFilter, setProvidedFilter] = useState<string>();
  const navigate = useNavigate();
  const lastSearchText = useDebounce(searchText, 300);
  const lastSearchBlock = useDebounce(blockFilter, 300);
  const [paymentFilter, setPaymentFilter] = useState<string>();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: lastSearchText,
        page: currentPage,
        page_size: pageSize,
        stage: stageFilter,
        provided: providedFilter,
        block: lastSearchBlock,
        payments: paymentFilter,
      },
    };

    setLoading(true);
    axios
      .get(`commercial/contracts`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setClients(response.data.data);
          setPagination(response.data.meta);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [lastSearchText, currentPage, pageSize, reload, stageFilter, providedFilter, lastSearchBlock, paymentFilter]);

  const exportSelection = () => {
    const config = {
      responseType: 'blob',
      params: {
        search: lastSearchText,
        page: currentPage,
        page_size: pageSize,
        stage: stageFilter,
        provided: providedFilter,
        block: lastSearchBlock,
      },
    };

    setDownloading(true);
    axios({
      url: 'commercial/clients/export', //your url
      params: config.params,
      method: 'GET',
      responseType: 'blob', // important
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'ventas_' + dayjs().format('D-M-YYYY') + '.xlsx';
          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const deleteClient = (uuid: string) => {
    axios
      .delete(`commercial/clients/${uuid}`)
      .then(() => {
        setReload(true);
      })
      .catch(error => ErrorHandler.showNotification(error));
  };

  const columns = [
    {
      title: 'Etapa',
      align: 'center',
      dataIndex: 'items',
      width: 50,
      render: (items: any[]) => items.find(i => i.description == 'Etapa').value,
    },
    {
      title: 'Mz.',
      align: 'center',
      dataIndex: 'items',
      width: 45,
      render: (items: any[]) => items.find(i => i.description == 'Manzana').value,
    },
    {
      title: 'Lote',
      align: 'center',
      dataIndex: 'items',
      width: 40,
      render: (items: any[]) => items.find(i => i.description == 'Lote').value,
    },
    {
      title: 'Modalidad',
      dataIndex: 'items',
      width: 120,
      render: (items: any[]) => items.find(i => i.description == 'Modalidad').value,
    },
    {
      title: 'Nombre',
      dataIndex: 'client',
      width: 280,
      render: (client: Client) => {
        return (
          <>
            {client.entity.name} {client.entity.last_name} <br />
            <small>
              <ProfileDocument profile={client.entity} />
            </small>
          </>
        );
      },
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      render: (amount: number) => <MoneyString value={amount} />,
    },
    {
      title: 'Fecha de compra',
      dataIndex: 'date_start',
      render: (date_start: string) => dayjs(date_start).format('DD-MM-YYYY'),
    },
    {
      title: 'Fecha de entrega',
      dataIndex: 'provided_at',
      render: (provided_at: string) => (provided_at ? dayjs(provided_at).format('DD-MM-YYYY') : ''),
    },
    {
      title: 'Deuda',
      dataIndex: 'invoices',
      render: (invoices: Invoice[]) => {
        return invoices?.map((i, index) => {
          return (
            <Tooltip
              title={
                <>
                  Total <MoneyString value={i.amount} />
                  {i.pending_payment && (
                    <>
                      Pendiente por pagar: <MoneyString value={i.pending_payment} />
                    </>
                  )}
                </>
              }>
              <Tag color={i.paid_at ? 'green' : 'red'}>
                {i.concept}: <MoneyString value={i.pending_payment} />
              </Tag>
            </Tooltip>
          );
        });
      },
    },
  ];
  return (
    <ModuleContent>
      <ContentHeader
        tools={
          <>
            Total: {pagination?.total}
            <Tooltip title={'Exportar listado actual en formato excel'}>
              <PrimaryButton
                icon={<RiFileExcel2Fill size={18} />}
                onClick={exportSelection}
                size={'small'}
                loading={downloading}
                label={'Exportar'}
              />
            </Tooltip>
          </>
        }
        title={'Ventas'}
        onRefresh={() => setReload(!reload)}>
        <FilterForm
          onInitialValues={values => {
            if (values?.search) setSearchText(values.search);
            if (values?.payments) setPaymentFilter(values.payments);
            if (values?.stage) setStageFilter(values.stage);
            if (values?.provided) setStageFilter(values.provided);
            if (values?.block) setStageFilter(values.block);
          }}
          onSubmit={values => {
            setPaymentFilter(values.payments);
            setSearchText(values?.search);
            setStageFilter(values?.stage);
            setProvidedFilter(values?.provided);
            setBlockFilter(values?.block);
          }}>
          <Form.Item name={'search'} label={'Buscar'}>
            <Input allowClear placeholder={'Buscar por nombre, dni o correo'} />
          </Form.Item>
          <Form.Item name={'stage'} label={'Etapa'}>
            <Select
              placeholder={'Todas'}
              allowClear
              style={{width: 100}}
              options={[
                {label: 'Etapa IV-A', value: 'IV-A'},
                {label: 'Etapa IV', value: 'IV'},
                {label: 'Etapa III', value: 'III'},
                {label: 'Etapa II', value: 'II'},
                {label: 'Etapa I', value: 'I'},
              ]}
            />
          </Form.Item>
          <Form.Item name={'block'} label={'Manzana'}>
            <Input placeholder={'Todas'} allowClear style={{width: 75}} />
          </Form.Item>
          <Form.Item name={'provided'} label={'Entregado'}>
            <Select
              placeholder={'Todas'}
              allowClear
              style={{width: 125}}
              options={[
                {label: 'Entregados', value: '1'},
                {label: 'No entregados', value: '0'},
              ]}
            />
          </Form.Item>
          <Form.Item name={'payments'} label={'Pagos'}>
            <Select
              placeholder={'Todos'}
              allowClear
              style={{width: 125}}
              options={[
                {label: 'Pagados', value: '1'},
                {label: 'Con deuda', value: '0'},
              ]}
            />
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <Space size={'large'}>
        {commercialStats && (
          <>
            <Progress
              showInfo
              type={'dashboard'}
              size={40}
              percent={Math.round((commercialStats?.contracts.provided * 100) / commercialStats.contracts.total)}
            />
            <Statistic title={'Entregados'} value={commercialStats.contracts.provided} />
            <Statistic title={'Vendidas'} value={commercialStats.contracts.total} />
          </>
        )}
      </Space>
      <TableList loading={loading} columns={columns} dataSource={clients} pagination={false} />
      {pagination && (
        <Pagination
          size="small"
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          total={pagination.total}
          current={pagination.current_page}
          pageSize={pagination.per_page}
        />
      )}
    </ModuleContent>
  );
};

export default EstateProviding;
