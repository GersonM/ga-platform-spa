import React, {useEffect, useState} from 'react';
import axios from "axios";
import type {StorageProduct, StorageStock, StorageWarehouse} from "../../../Types/api.tsx";
import TableList from "../../../CommonUI/TableList";
import MoneyString from "../../../CommonUI/MoneyString";
import FilterForm from "../../../CommonUI/FilterForm";
import {Divider, Form, Modal, Select, Space} from "antd";
import ProductStockForm from "../ProductStockForm";
import IconButton from "../../../CommonUI/IconButton";
import {TbPencil, TbTrash} from "react-icons/tb";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

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

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 60,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
    },
    {
      title: 'Nombre',
      dataIndex: 'product',
      render: (product: StorageProduct) => product.name
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      render: (warehouse: StorageWarehouse) => <>
        {warehouse.name} <br/>
        <small>{warehouse.address}</small>
      </>
    },
    {
      title: 'Consumible',
      dataIndex: 'is_consumable',
      render: (is_consumable: boolean) => is_consumable ? 'SI':'No'
    },
    {
      title: 'Venta',
      dataIndex: 'sale_price',
      render: (sale_price: number, row: StorageStock) => <>
        <MoneyString value={sale_price}/> <br/>
        <small>
          Costo: <MoneyString value={row.cost_price}/>
        </small>
      </>
    },
    {
      title: '',
      dataIndex: 'uuid',
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
      <h3>Existencias</h3>
      <FilterForm>
        <Form.Item>
          <Select
            placeholder={'Estado'}
            style={{width: 120}}
            onChange={value => {
              setStockState(value);
            }} options={[
            {label: 'Vendidos', value: 'sold'},
            {label: 'Disponible', value: 'available'},
            {label: 'Reservados', value: 'reserved'},
            {label: 'Merma', value: 'wasted'},
          ]}/>
        </Form.Item>
      </FilterForm>
      <TableList columns={columns} dataSource={productStock}/>
      <PrimaryButton label={'Agregar stock'} onClick={() => {
        setOpenStockForm(true);
        setSelectedStock(undefined);
      }}/>
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
