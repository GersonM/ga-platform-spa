import {useEffect, useState} from 'react';
import {DatePicker, Form, Input, Modal, Pagination, Progress, Select, Space, Statistic, Tag, Tooltip} from 'antd';
import {RiFileExcel2Fill} from 'react-icons/ri';
import {TbPencil} from "react-icons/tb";
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FilterForm from '../../../CommonUI/FilterForm';
import type {Client, Contract, Invoice, Profile, ResponsePagination, StorageStock} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import MoneyString from '../../../CommonUI/MoneyString';
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import IconButton from "../../../CommonUI/IconButton";
import CreateContractForm from "../../Components/CommercialContractForm";
import ContractStatus from "./ContractStatus.tsx";
import Config from "../../../Config.tsx";
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import './styles.less';

const CommercialSales = () => {
  const [clients, setClients] = useState<Profile[]>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commercialStats, _setCommercialStats] = useState<any>();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [openContractForm, setOpenContractForm] = useState(false);
  const [filters, setFilters] = useState<any>();
  const [dateRangeFilter, setDateRangeFilter] = useState<any[] | null>()

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        ...filters,
        page: currentPage,
        page_size: pageSize,
        date_range: dateRangeFilter ? dateRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
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
  }, [currentPage, pageSize, reload, filters, dateRangeFilter]);

  const exportSelection = () => {
    const config = {
      responseType: 'blob',
      params: {
        page: currentPage,
        page_size: pageSize,
        ...filters
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

  const columns = [
    {
      title: 'N° / Estado',
      dataIndex: 'tracking_id',
      align: 'center',
      render: (tracking_id: string, row: Contract) => <>
        <code>{tracking_id}</code>
        <ContractStatus contract={row}/></>,
    },
    {
      title: 'Documentos',
      dataIndex: 'tracking_id',
      width: 120,
      render: (tracking_id: number, row: Contract) => {
        return <>
          {row.document_progress != null && <Progress size={{height: 3}} percent={row.document_progress}/>}
        </>;
      }
    },
    {
      title: 'Producto',
      dataIndex: 'contractable',
      width: 180,
      render: (contractable?: StorageStock) => {
        return contractable ? <>
          <code>{contractable.sku}</code>
          <small>{contractable.variation_name || contractable.product?.name}</small>
        </> : <small>Sin producto relacionado</small>;
      },
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      width: 300,
      render: (client: Client) => {
        const isCompany = client?.type.includes('Company');
        const e = client?.entity;
        if (!e) return 'Sin cliente';
        return (
          <>
            {isCompany ?
              <CompanyChip company={e}/> :
              <ProfileChip profile={e} showDocument/>
            }
          </>
        );
      },
    },
    {
      title: 'Vendedor',
      dataIndex: 'created_by',
      width: 210,
      render: (created_by: Profile, contract: Contract) => {
        return created_by ?
          <ProfileChip profile={created_by}/> :
          contract.items?.find(i => i.description == 'Vendedor')?.value
      },
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      align: 'right',
      render: (amount: number, row: Contract) => <MoneyString currency={row.contractable?.currency} value={amount}/>,
    },
    {
      title: 'F. Venta',
      width: 140,
      dataIndex: 'approved_at',
      render: (approved_at: string) => {
        return <>
          {dayjs(approved_at).fromNow()}
          <small>{dayjs(approved_at).format('DD/MM/YYYY HH:MM')}</small>
        </>
      },
    },
    {
      title: 'Pagos vencidos',
      dataIndex: 'invoices',
      render: (invoices: Invoice[]) => {
        return invoices?.map((i, _index) => {
          return (
            <Tooltip
              title={
                <>
                  Total <MoneyString value={i.amount}/>
                  {i.pending_payment && (
                    <>
                      Pendiente por pagar: <MoneyString value={i.pending_payment}/>
                    </>
                  )}
                </>
              }>
              <Tag color={i.paid_at ? 'green' : 'red'}>
                {i.tracking_id}: <MoneyString value={i.pending_payment}/>
              </Tag>
            </Tooltip>
          );
        });
      },
    },
    {
      dataIndex: 'uuid',
      render: (uuid: string) => {
        return <IconButton icon={<TbPencil/>} onClick={() => navigate(`/commercial/contracts/${uuid}`)}/>;
      }
    }
  ];
  return (
    <ModuleContent>
      <ContentHeader
        onAdd={() => setOpenContractForm(true)}
        title={'Ventas'}
        tools={
          <>
            Total: {pagination?.total}
            <Tooltip title={'Exportar listado actual en formato excel'}>
              <PrimaryButton
                icon={<RiFileExcel2Fill size={18}/>}
                onClick={exportSelection}
                size={'small'}
                loading={downloading}
                label={'Exportar'}
              />
            </Tooltip>
          </>
        }
        onRefresh={() => setReload(!reload)}>
        <FilterForm
          onInitialValues={values => setFilters(values)}
          onSubmit={values => {
            setFilters(values);
          }}>
          <Form.Item name={'search'} label={'Buscar'}>
            <Input allowClear placeholder={'Buscar por nombre, dni o correo'}/>
          </Form.Item>
          <Form.Item>
            <DatePicker.RangePicker format={'DD/MM/YYYY'} onChange={value => setDateRangeFilter(value)}/>
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
            <Statistic title={'Entregados'} value={commercialStats.contracts.provided}/>
            <Statistic title={'Vendidas'} value={commercialStats.contracts.total}/>
          </>
        )}
      </Space>
      <TableList scroll={{x: 1100}} customStyle={false} loading={loading} columns={columns} dataSource={clients}/>
      {pagination && (
        <Pagination
          style={{marginTop: 10}}
          align={'center'}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          total={pagination.total}
          current={pagination.current_page}
          pageSize={pagination.per_page}
        />
      )}
      <Modal
        destroyOnHidden
        width={800}
        open={openContractForm}
        onCancel={() => setOpenContractForm(false)}
        footer={false}>
        <CreateContractForm onComplete={contract => navigate(`/commercial/contracts/${contract.uuid}`)}/>
      </Modal>
    </ModuleContent>
  );
};

export default CommercialSales;
