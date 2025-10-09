import React, {useEffect, useState} from 'react';
import {
  TbEye,
  TbPencil,
  TbPlus,
  TbReload,
  TbTrash
} from "react-icons/tb";
import {Form, Image, Input, Pagination, Popconfirm, Select, Space, Tag, Tooltip} from "antd";
import {PiArrowRightFill, PiStackPlusBold} from "react-icons/pi";
import pluralize from "pluralize";
import axios from "axios";

import type {
  ApiFile,
  ResponsePagination,
  StorageProduct,
  StorageProductVariation,
  StorageStock,
} from "../../../Types/api.tsx";
import ProductStockForm from "../ProductStockForm";
import IconButton from "../../../CommonUI/IconButton";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import ModalView from "../../../CommonUI/ModalView";
import ProductVariationForm from "../ProductVariationForm";
import TableList from "../../../CommonUI/TableList";
import CustomTag from "../../../CommonUI/CustomTag";
import MoneyString from "../../../CommonUI/MoneyString";
import FilterForm from "../../../CommonUI/FilterForm";

interface ProductStockManagerProps {
  product: StorageProduct;
}

const ProductStockManager = ({product}: ProductStockManagerProps) => {
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
  const [filters, setFilters] = useState<any>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {...filters, product_uuid: product.uuid, page: currentPage}
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
  }, [reload, stockState, filters]);

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
      title: 'Portada',
      dataIndex: 'attachments',
      width: 90,
      render: (attachments?: ApiFile[]) => {
        const cover = attachments?.filter(f => f.code == 'cover');
        return cover?.length ? <Image preview={false} src={cover[0].source} width={70}/> : <small>Sin imagen</small>;
      }
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      render: (sku: string, row: StorageProductVariation) => {
        return <>
          {row.variation_name || row.product?.name}
          <CustomTag>
            <code>
              {sku}
            </code>
          </CustomTag>
        </>;
      }
    },
    {
      title: 'Resumen',
      dataIndex: 'excerpt',
      render: (excerpt: string) => <small>{excerpt}</small>
    },
    {
      title: 'Estado',
      dataIndex: 'is_public',
      render: (is_public: boolean) => {
        return <CustomTag color={is_public ? 'green' : 'orange'}>{is_public ? 'Público' : 'Privado'}</CustomTag>;
      }
    },
    {
      title: 'Existencias',
      dataIndex: 'available_stock',
      render: (available_stock: number) => {
        return <code><small>{product?.unit_type ? pluralize(product?.unit_type, available_stock, true) : '0'}</small></code>;
      }
    },
    {
      title: 'Precios',
      dataIndex: 'price_range',
      render: (price_range: any) => {
        return price_range.min != price_range.max ?
          <><MoneyString value={price_range.min}/> <PiArrowRightFill style={{margin: '0 5px'}}/> <MoneyString
            value={price_range.max}/></> :
          <MoneyString value={price_range.min}/>;
      }
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 70,
      render: (uuid: string, variation: StorageProductVariation) => {
        return <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedVariation(variation);
            setOpenVariationForm(true);
          }}/>
          <IconButton title={'Agregar stock'} small icon={<PiStackPlusBold/>} onClick={() => {
            setSelectedVariation(variation);
            setOpenStockForm(true);
          }}/>
          <Tooltip title={'Hacer privado'}>
            <IconButton small icon={<TbEye/>} onClick={() => deleteStock(uuid)}/>
          </Tooltip>
          <Popconfirm
            title={'Eliminar variación'}
            description={'Al eliminar esto, se borraran también las imagenes relacionadas'}
            onConfirm={() => deleteVariation(uuid)}>
            <IconButton danger small icon={<TbTrash/>}/>
          </Popconfirm>
        </Space>;
      }
    }
  ]

  return (
    <div>
      <Space>
        <h2>Variaciones para {product.name}</h2>
        <Tag color={'blue'} bordered={false}>{product.code}</Tag>
        <IconButton icon={<TbReload/>} onClick={() => setReload(!reload)}/>
        <PrimaryButton icon={<TbPlus/>} ghost label={'Nueva variación'} onClick={() => {
          setSelectedVariation(undefined);
          setOpenVariationForm(true);
        }}/>
      </Space>
      <p>{product.excerpt || <small>Sin descripción</small>}</p>
      <FilterForm updateUrl={false} onSubmit={values => setFilters(values)}>
        <Form.Item name={'search'} label={'Buscar'}>
          <Input placeholder={'Buscar nombre o SKU'}/>
        </Form.Item>
        <Form.Item label={'Estado'} name={'is_public'}>
          <Select
            allowClear
            placeholder={'Todos'}
            onChange={value => {
              setStockState(value);
            }} options={[
            {label: 'Publicos', value: '1'},
            {label: 'Privados', value: '0'},
          ]}/>
        </Form.Item>
      </FilterForm>
      <TableList
        scroll={{x: 800}} customStyle={false} loading={loading}
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
        <ProductStockForm variation={selectedVariation} stock={selectedStock} onComplete={() => {
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
        <ProductVariationForm product={product} variation={selectedVariation} onComplete={() => {
          setReload(!reload);
          setOpenVariationForm(false);
          setSelectedVariation(undefined);
        }}/>
      </ModalView>
    </div>
  );
};

export default ProductStockManager;
