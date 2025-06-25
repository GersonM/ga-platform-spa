import React, {useEffect, useState} from 'react';
import {TbPencil, TbPlus, TbTrash} from "react-icons/tb";
import {Divider, Form, Modal, Popover, Select, Space, Table, Tag, Tooltip} from "antd";
import axios from "axios";

import type {StorageProduct, StorageStock, StorageWarehouse} from "../../../Types/api.tsx";
import TableList from "../../../CommonUI/TableList";
import MoneyString from "../../../CommonUI/MoneyString";
import FilterForm from "../../../CommonUI/FilterForm";
import ProductStockForm from "../ProductStockForm";
import IconButton from "../../../CommonUI/IconButton";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {PiWarning} from "react-icons/pi";

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

  const columns: any[] = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 80,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      responsive:['md'],
      render: (warehouse: StorageWarehouse) => <>
        {warehouse.name} <br/>
        <small>{warehouse.address}</small>
      </>
    },
    {
      title: 'Consumible',
      dataIndex: 'is_consumable',
      render: (is_consumable: boolean) => is_consumable ? 'SI' : 'No'
    },
    {
      title: 'Venta',
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
                <MoneyString value={sale_price} currency={row.currency}/> <br/>
                <small>
                  Costo: <MoneyString value={row.cost_price} currency={row.currency}/>
                </small>
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
          <IconButton small icon={<TbTrash/>} danger/>
        </Space>;
      }
    }
  ]

  return (
    <div>
      <h2>Existencias para {product.name} <Tag color={'blue'} bordered={false}>{product.code}</Tag></h2>
      <p>{product.description}</p>
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
      <Table pagination={false} rowKey={'uuid'} size={"small"} style={{marginTop: 15}} loading={loading} columns={columns} dataSource={productStock}/>
      <Modal footer={null} open={openStockForm} onCancel={() => {
        setOpenStockForm(false);
        setSelectedStock(undefined);
      }}>
        <ProductStockForm product={product} stock={selectedStock} onComplete={() => {
          setReload(!reload);
          setOpenStockForm(false);
          setSelectedStock(undefined);
        }}/>
      </Modal>
    </div>
  );
};

export default ProductStockManager;
