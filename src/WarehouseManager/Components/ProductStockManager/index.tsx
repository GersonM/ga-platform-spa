import React, {useContext, useEffect, useState} from 'react';
import {TbPencil, TbPlus, TbRecycleOff, TbShredder} from "react-icons/tb";
import {Divider, Popover, Select, Space, Table, Tag, Tooltip} from "antd";
import {PiWarning} from "react-icons/pi";
import axios from "axios";

import type {StorageProduct, StorageStock, StorageWarehouse} from "../../../Types/api.tsx";
import MoneyString from "../../../CommonUI/MoneyString";
import ProductStockForm from "../ProductStockForm";
import IconButton from "../../../CommonUI/IconButton";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import AuthContext from "../../../Context/AuthContext.tsx";
import ModalView from "../../../CommonUI/ModalView";
import StockStatus from "./StockStatus.tsx";
import dayjs from "dayjs";
import pluralize from "pluralize";

interface ProductStockManagerProps {
  product: StorageProduct;
}

const ProductStockManager = ({product}: ProductStockManagerProps) => {
  const [productStock, setProductStock] = useState<StorageStock[]>();
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false);
  const [stockState, setStockState] = useState<string>();
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [openStockForm, setOpenStockForm] = useState(false)
  const {user} = useContext(AuthContext);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {status: stockState}
    };

    setLoading(true);

    axios
      .get(`warehouses/products/${product.uuid}/stock`, config)
      .then(response => {
        if (response) {
          setProductStock(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, stockState]);

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
      title: 'SKU',
      dataIndex: 'sku',
      render: (sku: string, row: StorageStock) => {
        return <>
          {sku} <br/>
          <small>
            {row.variation_name ? row.variation_name : row.product?.name}
          </small>
        </>;
      }
    },
    {
      title: 'Vence',
      dataIndex: 'expiration_date',
      render: (expiration_date:string) => {
        return expiration_date ? dayjs(expiration_date).fromNow() : '';
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      width: 100,
      render: (status:string) => {
        return <StockStatus status={status} />;
      }
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      responsive: ['md'],
      render: (warehouse: StorageWarehouse) => <>
        {warehouse.name} <br/>
        <small>{warehouse.address}</small>
      </>
    },
    {
      title: 'Cantidad',
      dataIndex: 'is_consumable',
      render: (is_consumable: boolean, row: StorageStock) =>
        is_consumable ? pluralize(row.product?.unit_type || 'unidad', row.quantity, true) : 'Sin límite'
    },
    {
      title: 'Precios',
      dataIndex: 'sale_price',
      render: (sale_price: number, row: StorageStock) => {
        const earn = (row.sale_price || 0) - (row.cost_price || 0);
        return <>
          <Popover content={<>
            Ganancia: <MoneyString value={earn} currency={row.currency}/> <br/>
            Porcentaje: {((earn * 100) / (row.sale_price || 1)).toFixed(2)}%
          </>}>
            <Space>
              <div>
                {sale_price != null ?
                  <MoneyString value={sale_price} currency={row.currency}/> : 'No se vende'
                }
                {row.cost_price && <small>
                  Costo: <MoneyString value={row.cost_price} currency={row.currency}/>
                </small>}
              </div>
              {earn < 0 && <PiWarning size={18} color="red"/>}
            </Space>
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

  return (
    <div>
      <h2>Existencias para {product.name} <Tag color={'blue'} bordered={false}>{product.code}</Tag></h2>
      <p>{product.excerpt}</p>
      <Space split={<Divider type={"vertical"}/>}>
        <Select
          placeholder={'Filtrar por estado'}
          style={{width: 200}}
          onChange={value => {
            setStockState(value);
          }} options={[
          {label: 'Vendidos', value: 'sold'},
          {label: 'Disponible', value: 'available'},
          {label: 'Reservados', value: 'reserved'},
          {label: 'Merma', value: 'wasted'},
        ]}/>
        <PrimaryButton icon={<TbPlus/>} ghost label={'Agregar stock'} onClick={() => {
          setOpenStockForm(true);
          setSelectedStock(undefined);
        }}/>
      </Space>
      <Table pagination={false} rowKey={'uuid'} size={"small"} style={{marginTop: 15}} loading={loading}
             columns={columns} dataSource={productStock}/>
      <ModalView
        open={openStockForm}
        onCancel={() => {
          setOpenStockForm(false);
          setSelectedStock(undefined);
        }}>
        <ProductStockForm product={product} stock={selectedStock} onComplete={() => {
          setReload(!reload);
          setOpenStockForm(false);
          setSelectedStock(undefined);
        }}/>
      </ModalView>
    </div>
  );
};

export default ProductStockManager;
