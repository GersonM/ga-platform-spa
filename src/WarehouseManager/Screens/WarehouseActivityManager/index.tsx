import {useEffect, useState} from "react";
import {Form, Input, Pagination, Select} from 'antd';
import dayjs from "dayjs";
import axios from "axios";

import type {Profile, ResponsePagination, StorageProduct, StorageStock, StorageWarehouse} from "../../../Types/api.tsx";
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from "../../../CommonUI/TableList";
import FilterForm from "../../../CommonUI/FilterForm";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import StockActivityActionChip from "../../Components/StockActivityActionChip";
import StorageStockChip from "../../../Commercial/Components/StorageStockChip";
import CustomTag from "../../../CommonUI/CustomTag";
import WarehouseSelector from "../../Components/WarehouseSelector";

const WarehouseActivityManager = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<StorageProduct[]>();
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<any>()

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, with_stock: 1, ...filters},
    };

    setLoading(true);

    axios
      .get(`warehouses/stock-activity`, config)
      .then(response => {
        if (response) {
          setProducts(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, currentPage, filters]);

  const columns = [
    {
      title: 'Acción',
      dataIndex: 'action',
      align: 'center',
      width: 100,
      render: (action: string) => (
        <StockActivityActionChip action={action}/>
      )
    },
    {
      title: 'Usuario',
      dataIndex: 'profile',
      render: (profile: Profile) => (
        <ProfileChip profile={profile}/>
      )
    },
    {
      title: 'Comentarios',
      dataIndex: 'reason',
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      render: (warehouse: StorageWarehouse) => (
        <span>{warehouse.name} <br/> <small>{warehouse.address}</small></span>
      )
    },
    {
      title: 'ID / N° Serie',
      dataIndex: 'stock',
      render: (stock: StorageStock) => (
        <CustomTag>
          <code>
            {stock?.serial_number}
          </code>
        </CustomTag>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'stock',
      render: (stock: StorageStock) => (
        <StorageStockChip storageStock={stock}/>
      )
    },
    {
      title: 'Fecha',
      width: 190,
      dataIndex: 'created_at',
      render: (date: any) => {
        return (
          <>
            {dayjs(date).fromNow()} <br/>
            <small>{dayjs(date).format('DD [de] MMMM [del] YYYY hh:mm a')}</small>
          </>
        );
      },
    },
  ]

  return (
    <ModuleContent>
      <ContentHeader
        title={'Actividad del inventario'}
        loading={loading}
        onRefresh={() => setReload(!reload)}
        />
      <FilterForm
        onInitialValues={values => setFilters(values)}
        onSubmit={values => setFilters(values)}
      >
        <Form.Item name={'search'} label={'Buscar'}>
          <Input.Search
            allowClear
            placeholder={'Buscar por nombre, código o descripción'}
          />
        </Form.Item>
        <Form.Item name={'warehouse_uuid'} label={'Almacen'}>
          <WarehouseSelector />
        </Form.Item>
        <Form.Item name={'action'} label={'Acción'}>
          <Select
            allowClear
            popupMatchSelectWidth={false}
            placeholder={'Todos'}
            options={[
            {label:'Venta', value:'outlet'},
            {label:'Ingreso', value:'entrance'},
            {label:'Reserva', value:'reserve'},
            {label:'Perdida', value:'waste'},
            {label:'Transporte Salida', value:'moving_out'},
            {label:'Transporte Ingreso', value:'moving_in'},
          ]}/>
        </Form.Item>
      </FilterForm>
      <TableList columns={columns} dataSource={products}/>
      {pagination && (
        <Pagination
          showSizeChanger={false}
          style={{marginTop: 10}}
          onChange={(page) => {
            setCurrentPage(page);
          }}
          align={'center'}
          total={pagination.total}
          showTotal={(total) => `${total} productos en total`}
          pageSize={pagination.per_page}
          current={pagination.current_page}/>
      )}
    </ModuleContent>
  );
};

export default WarehouseActivityManager;
