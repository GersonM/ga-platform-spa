import React, {useContext, useEffect, useState} from 'react';
import {TbPencil, TbPlus, TbRecycleOff, TbShredder} from "react-icons/tb";
import {Divider, Pagination, Popover, Select, Space, Table, Tag, Tooltip} from "antd";
import {PiWarning} from "react-icons/pi";
import pluralize from "pluralize";
import dayjs from "dayjs";
import axios from "axios";

import type {
  ResponsePagination,
  StorageProduct,
  StorageProductVariation,
  StorageStock,
  StorageWarehouse
} from "../../../Types/api.tsx";
import MoneyString from "../../../CommonUI/MoneyString";
import ProductStockForm from "../ProductStockForm";
import IconButton from "../../../CommonUI/IconButton";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import AuthContext from "../../../Context/AuthContext.tsx";
import ModalView from "../../../CommonUI/ModalView";
import StockStatus from "./StockStatus.tsx";
import ProductVariationForm from "../ProductVariationForm";
import TableList from "../../../CommonUI/TableList";

interface ProductStockManagerProps {
  product: StorageProduct;
}

const ProductStockManager = ({product}: ProductStockManagerProps) => {
  const [productStock, setProductStock] = useState<StorageStock[]>();
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false);
  const [stockState, setStockState] = useState<string>();
  const [variations, setVariations] = useState()
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [openStockForm, setOpenStockForm] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<StorageProductVariation>();
  const [openVariationForm, setOpenVariationForm] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>()
  const [currentPage, setCurrentPage] = useState<number>(1);
  const {user} = useContext(AuthContext);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {status: stockState, product_uuid: product.uuid}
    };

    setLoading(true);

    axios
      .get(`warehouses/variations`, config)
      .then(response => {
        if (response) {
          setVariations(response.data.data);
          setPagination(response.data.meta);
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

  const deleteVariation = (uuid: string, force: boolean = false) => {
    axios.delete(`warehouses/variations/${uuid}`, {params: {force: force ? 1 : 0}})
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
      render: (sku: string, row: StorageProductVariation) => {
        return <>
          {sku} <br/>
          <small>
            {row.variation_name ? row.variation_name : row.product?.name}
          </small>
        </>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'is_public',
      width: 100,
    },
    {
      title: 'Precios',
      dataIndex: 'uuid',
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 70,
      render: (uuid: string, stock: StorageProductVariation) => {
        return <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedVariation(stock);
            setOpenVariationForm(true);
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
      <h2>Variaciones para {product.name} <Tag color={'blue'} bordered={false}>{product.code}</Tag></h2>
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
          setSelectedVariation(undefined);
          setOpenVariationForm(true);
        }}/>
      </Space>
      <TableList customStyle={false} style={{marginTop: 15}} loading={loading}
             columns={columns} dataSource={variations}/>
      {pagination && (
        <Pagination
          align={'center'}
          showSizeChanger={false}
          style={{marginTop: 10}}
          onChange={(page) => {
            setCurrentPage(page);
          }}
          size={"small"} total={pagination.total}
          showTotal={(total) => `${total} productos en total`}
          pageSize={pagination.per_page}
          current={pagination.current_page}/>
      )}
      <ModalView
        width={700}
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
      <ModalView
        width={900}
        open={openVariationForm}
        onCancel={() => {
          setOpenVariationForm(false);
          setSelectedVariation(undefined);
        }}>
        <ProductVariationForm product={product} stock={selectedVariation} onComplete={() => {
          setReload(!reload);
          setOpenVariationForm(false);
          setSelectedVariation(undefined);
        }}/>
      </ModalView>
    </div>
  );
};

export default ProductStockManager;
