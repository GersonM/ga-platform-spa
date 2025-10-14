import React, {useContext, useEffect, useState} from 'react';
import {TbPencil, TbRecycleOff, TbShredder} from "react-icons/tb";
import {Drawer, Form, Input, Pagination, Popover, Progress, Select, Space, Table, Tooltip} from "antd";
import dayjs from "dayjs";
import pluralize from "pluralize";
import axios from "axios";

import type {
  ResponsePagination,
  StorageStock,
  StorageWarehouse
} from "../../../Types/api.tsx";
import MoneyString from "../../../CommonUI/MoneyString";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import AuthContext from "../../../Context/AuthContext.tsx";
import ModalView from "../../../CommonUI/ModalView";
import StockStatus from "../../Components/ProductStockManager/StockStatus.tsx";
import ProductStockForm from "../../Components/ProductStockForm";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import FilterForm from "../../../CommonUI/FilterForm";
import WarehouseSelector from "../../Components/WarehouseSelector";
import StorageStockChip from "../../../Commercial/Components/StorageStockChip";
import CustomTag from "../../../CommonUI/CustomTag";
import ProductVariationSelector from "../../Components/ProductVariationSelector";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

const WarehouseStockManager = () => {
  const [productStock, setProductStock] = useState<StorageStock[]>();
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false);
  const [stockState, setStockState] = useState<string>();
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [openStockForm, setOpenStockForm] = useState(false)
  const [filters, setFilters] = useState<any>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [stockStats, setStockStats] = useState<any>();
  const {user} = useContext(AuthContext);
  const [openStockReport, setOpenStockReport] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token};

    axios
      .get(`warehouses/stock/stats`, config)
      .then(response => {
        if (response) {
          console.log(response.data);
          setStockStats(response.data);
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
      params: {...filters, page: currentPage, per_page: pageSize},
    };

    setLoading(true);

    axios
      .get(`warehouses/stock`, config)
      .then(response => {
        if (response) {
          setProductStock(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, stockState, filters, currentPage, pageSize]);

  const deleteStock = (uuid: string, force: boolean = false) => {
    axios.delete(`warehouses/stock/${uuid}`, {params: {force: force ? 1 : 0}})
      .then(() => {
        setReload(!reload);
      })
      .catch((error) => {
        ErrorHandler.showNotification(error);
      });
  }

  const columns: any[] = [
    {
      title: 'N° Serie / ID',
      dataIndex: 'serial_number',
      render: (serial_number: string) => {
        return <small><code>{serial_number}</code></small>;
      }
    },
    {
      title: 'Vence',
      dataIndex: 'expiration_date',
      render: (expiration_date: string) => {
        return expiration_date ? dayjs(expiration_date).fromNow() : <small>No vence</small>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        return <StockStatus status={status}/>;
      }
    },
    {
      title: 'Producto',
      dataIndex: 'uuid',
      render: (_uuid: string, row: StorageStock) => <>
        <StorageStockChip storageStock={row}/>
      </>
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      responsive: ['md'],
      render: (warehouse?: StorageWarehouse) => <>
        {warehouse?.name} <br/>
        <small>{warehouse?.address}</small>
      </>
    },
    {
      title: 'Cantidad',
      dataIndex: 'is_consumable',
      render: (is_consumable: boolean, row: StorageStock) =>
        is_consumable ?
          pluralize(row.variation?.product?.unit_type || 'unidad', row.quantity, true) :
          <CustomTag>Sin límite</CustomTag>
    },
    {
      title: 'Precio de venta',
      dataIndex: 'sale_price',
      render: (sale_price: number, row: StorageStock) => {
        const earn = (row.sale_price || 0) - (row.cost_price || 0);
        return <>
          <Popover content={<>
            Ganancia: <MoneyString value={earn} currency={row.currency}/> <br/>
            Porcentaje: {((earn * 100) / (row.sale_price || 1)).toFixed(2)}%
          </>}>
            <div>
              {sale_price != null ?
                <MoneyString value={sale_price} currency={row.currency}/> :
                <CustomTag color={'orange'}>Sin precio de venta</CustomTag>
              }
              {row.cost_price != null && <small>
                Costo: <MoneyString value={row.cost_price} currency={row.currency}/>
              </small>}
            </div>
          </Popover>
        </>;
      }
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 70,
      render: (uuid: string, stock: StorageStock) => {
        return <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedStock(stock);
            setOpenStockForm(true);
          }}/>
          {user?.roles?.includes('admin') &&
            <Tooltip title={'Destruir registro'}>
              <IconButton small icon={<TbShredder/>} danger onClick={() => deleteStock(uuid, true)}/>
            </Tooltip>
          }
          <Tooltip title={'Registrar como dañado'}>
            <IconButton small icon={<TbRecycleOff/>} danger onClick={() => deleteStock(uuid)}/>
          </Tooltip>
        </Space>;
      }
    }
  ]

  const getStockReport = () => {
    axios.get("/warehouses/stock/report")
    .then(response=>{      
      console.log(response);
      /*
       if (response) {
          setProductStock(response.data.data);
          setPagination(response.data.meta);
        }
          */
      
    })
    .catch(response=>{
      console.log("error");
    });    
  }



  const percent = stockStats ? (stockStats.sold / stockStats.total) * 100 : 0;

  return (
    <ModuleContent>
      <ContentHeader
        onRefresh={() => setReload(!reload)}
        onAdd={() => {
          setOpenStockForm(true);
          setSelectedStock(undefined);
        }}
        title={'Existencias'}
        tools={<>
          {stockStats?.sold} vendidos de {stockStats?.total} | {stockStats?.available} disponibles
          <Progress percent={Math.round(percent)} style={{width: '200px'}}/>
          <PrimaryButton label={'Exportar reporte'} onClick={getStockReport}/>
        </>}
      >
        <FilterForm onSubmit={values => setFilters(values)}>
          <Form.Item label="Nombre" name={'search'}>
            <Input/>
          </Form.Item>
          <Form.Item label="Producto" name={'variation_uuid'}>
            <ProductVariationSelector/>
          </Form.Item>
          <Form.Item label="Estado" name={'status'}>
            <Select
              allowClear
              placeholder={'Filtrar por estado'}
              style={{width: 200}}
              onChange={value => {
                setStockState(value);
              }} options={[
              {label: 'Vendidos', value: 'sold'},
              {label: 'Disponible', value: 'available'},
              {label: 'Reservados', value: 'reserved'},
              {label: 'Dañados', value: 'damaged'},
            ]}/>
          </Form.Item>
          <Form.Item label={'Almacén'} name={'storage_uuid'}>
            <WarehouseSelector/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <Drawer open={openStockReport} title={'Filtros'} onClose={() => setOpenStockReport(false)}>

      </Drawer>
      <Table pagination={false} rowKey={'uuid'} size={"small"} style={{marginTop: 15}} loading={loading}
             columns={columns} dataSource={productStock}/>
      {pagination && (
        <Pagination
          style={{marginTop: 15}}
          align={'center'}
          showTotal={(total) => `${total} productos en total`}
          current={pagination.current_page}
          pageSize={pagination.per_page}
          total={pagination.total}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      )}
      <ModalView
        open={openStockForm}
        width={900}
        onCancel={() => {
          setOpenStockForm(false);
          setSelectedStock(undefined);
        }}>
        <ProductStockForm stock={selectedStock} onComplete={() => {
          setReload(!reload);
          setOpenStockForm(false);
          setSelectedStock(undefined);
        }}/>
      </ModalView>
    </ModuleContent>
  );
};

export default WarehouseStockManager;
