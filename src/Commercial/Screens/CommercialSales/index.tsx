import {useEffect, useState} from 'react';
import {
  DatePicker, Divider,
  Form,
  Input,
  Modal,
  Pagination, Popconfirm, Popover,
  Progress,
  Select,
  Space,
  Tag,
  Tooltip
} from 'antd';
import {RiFileExcel2Fill} from 'react-icons/ri';
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FilterForm from '../../../CommonUI/FilterForm';
import type {
  Client,
  Contract,
  Invoice,
  Profile,
  ResponsePagination,
  StorageContractCartItem,
} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import MoneyString from '../../../CommonUI/MoneyString';
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import IconButton from "../../../CommonUI/IconButton";
import ContractStatus from "./ContractStatus.tsx";
import Config from "../../../Config.tsx";
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import NewSaleForm from "../../Components/NewSaleForm";
import StorageStockChip from "../../Components/StorageStockChip";
import './styles.less';
import {LuCircleChevronRight} from "react-icons/lu";
import {TbTrash} from "react-icons/tb";

const CommercialSales = () => {
  const [clients, setClients] = useState<Profile[]>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [openContractForm, setOpenContractForm] = useState(false);
  const [filters, setFilters] = useState<any>();
  const [dateRangeFilter, setDateRangeFilter] = useState<any[] | null>();
  const [contractStats, setContractStats] = useState<any>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token, params: {
        date_range: dateRangeFilter ? dateRangeFilter.map(d => d.format(Config.dateFormatServer)) : null,
      }
    };

    axios
      .get(`commercial/contracts/stats`, config)
      .then(response => {
        if (response) {
          console.log(response.data);
          setContractStats(response.data);
        }
      })
      .catch(() => {
      });

    return cancelTokenSource.cancel;
  }, [reload]);

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

  const deleteContract = (uuid: string) => {
    axios.delete(`/commercial/contracts/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  }

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
      dataIndex: 'document_progress',
      width: 120,
      render: (document_progress?: number) => {
        return <>
          {document_progress != null ? <Progress size={{height: 3}} percent={document_progress}/> :
            <small>No asignado</small>}
        </>;
      }
    },
    {
      title: 'Productos',
      dataIndex: 'cart',
      width: 200,
      render: (cart?: StorageContractCartItem[]) => {
        if (!cart?.length) {
          return <small>Sin productos</small>;
        }
        return <Popover content={<div>
          <Space direction={'vertical'} split={<Divider style={{margin: '5px 0'}}/>}>
            {cart?.map((cI, index) => {
              return <StorageStockChip key={index} storageStock={cI.stock} quantity={cI.quantity}/>
            })}
          </Space>
        </div>}>
          <StorageStockChip storageStock={cart[0].stock} quantity={cart[0].quantity}/>
          {cart.length > 1 && <Tag bordered={false}>(...{cart.length - 1} más)</Tag>}
        </Popover>
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
      width: 100,
      render: (created_by: Profile, contract: Contract) => {
        return created_by ?
          <ProfileChip profile={created_by} small/> :
          contract.items?.find(i => i.description == 'Vendedor')?.value
      },
    },
    {
      title: 'Monto',
      dataIndex: 'totals',
      align: 'right',
      render: (totals: any) =>
        <>
          <MoneyString currency={'PEN'} value={totals?.PEN}/><br/>
          <MoneyString currency={'USD'} value={totals?.USD}/>
        </>,
    },
    {
      title: 'F. Venta',
      width: 160,
      dataIndex: 'approved_at',
      render: (approved_at?: string, contract?: Contract) => {
        return approved_at ? <>
          {dayjs(approved_at).fromNow()}
          <small>{dayjs(approved_at).format(Config.datetimeFormatUser)}</small>
        </> : <small>Aún no aprobado<br/>{dayjs(contract?.created_at).format(Config.datetimeFormatUser)}</small>
      },
    },
    {
      title: 'Pagos vencidos',
      dataIndex: 'invoices',
      render: (invoices: Invoice[]) => {
        return invoices?.map((i, index) => {
          return (
            <Tooltip
              key={index}
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
      render: (uuid: string, contract: Contract) => {
        return <Space>
          {(contract.status == 'cancelled' || contract.status == 'proposal') &&
            <Popconfirm title={'¿Seguro que quieres eliminar esta propuesta?'} onConfirm={() => deleteContract(uuid)}>
              <IconButton icon={<TbTrash/>} danger small/>
            </Popconfirm>
          }
          <IconButton icon={<LuCircleChevronRight/>} small onClick={() => navigate(`/commercial/contracts/${uuid}`)}/>
        </Space>;
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
            <Tooltip title={'Exportar listado actual en formato excel'}>
              <PrimaryButton
                icon={<RiFileExcel2Fill size={18}/>}
                onClick={exportSelection}
                size={'small'}
                loading={downloading}
                label={'Exportar'}
              />
            </Tooltip>
            {contractStats?.approved} ventas | {contractStats?.active} activas, {contractStats?.proposals} propuestas
            , {contractStats?.cancelled} canceladas y {contractStats?.provided} entregadas
          </>
        }
        onRefresh={() => setReload(!reload)}>
        <FilterForm
          onSubmit={values => {
            setFilters(values);
          }}
          onInitialValues={values => setFilters(values)}
        >
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
      <TableList scroll={{x: 1100}} customStyle={false} loading={loading} columns={columns} dataSource={clients}/>
      {pagination && (
        <Pagination
          style={{marginTop: 10}}
          align={'center'}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showTotal={total => `Total ${total}`}
          total={pagination.total}
          current={pagination.current_page}
          pageSize={pagination.per_page}
        />
      )}
      <Modal
        destroyOnHidden
        width={1000}
        open={openContractForm}
        onCancel={() => setOpenContractForm(false)}
        footer={false}>
        <NewSaleForm onComplete={contract => navigate(`/commercial/contracts/${contract.uuid}`)}/>
      </Modal>
    </ModuleContent>
  );
};

export default CommercialSales;
