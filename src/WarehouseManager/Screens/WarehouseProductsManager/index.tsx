import {useEffect, useState} from "react";
import {Form, Input, Pagination, Space, Tooltip} from 'antd';
import {TbPencil, TbStack2, TbTrash} from "react-icons/tb";
import {PiShippingContainer} from "react-icons/pi";
import axios from "axios";

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import type {ResponsePagination, StorageProduct} from "../../../Types/api.tsx";
import TableList from "../../../CommonUI/TableList";
import IconButton from "../../../CommonUI/IconButton";
import ProductForm from "../../Components/ProductForm";
import FilterForm from "../../../CommonUI/FilterForm";
import ProductGroupsSelector from "../../Components/ProductGroupsSelector";
import ProductBrandSelector from "../../Components/ProductBrandSelector";
import ProductManufacturerSelector from "../../Components/ProductManufacturerSelector";
import ProductStockManager from "../../Components/ProductStockManager";
import WarehouseManager from "../../Components/WarehouseManager";
import ModalView from "../../../CommonUI/ModalView";

const WarehouseProductsManager = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<StorageProduct[]>();
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StorageProduct>();
  const [openStockManager, setOpenStockManager] = useState(false);
  const [filters, setFilters] = useState<any>()
  const [openWarehouseManager, setOpenWarehouseManager] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {page: currentPage, with_stock: 1, ...filters},
    };

    setLoading(true);

    axios
      .get(`warehouses/products`, config)
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
      title: 'Nombre',
      dataIndex: 'name',
      width: 200,
      render: (name: string, product: StorageProduct) => (
        <span>{name} <br/> <small>{product.code}</small></span>
      )
    },
    {
      title: 'Descripción',
      responsive: ['md'],
      dataIndex: 'excerpt',
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      responsive: ['md'],
      width: 120,
    },
    {
      title: 'Empresa',
      dataIndex: 'manufacturer',
    },
    {
      title: 'Variaciones',
      width: 50,
      dataIndex: 'available_variations',
    },
    {
      title: 'Existencias',
      width: 50,
      dataIndex: 'available_stock',
    },
    {
      title: 'Tipo de unidad',
      dataIndex: 'unit_type',
    },
    {
      title: '',
      width: 90,
      render: (uuid: string, p: StorageProduct) => {
        return <Space size={"small"}>
          <Tooltip title={'Gestionar stock'}>
            <IconButton small icon={<TbStack2/>} onClick={() => {
              setOpenStockManager(true);
              setSelectedProduct(p);
            }}/>
          </Tooltip>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setOpenAddProduct(true);
            setSelectedProduct(p);
          }}/>
          <IconButton small icon={<TbTrash/>} danger/>
        </Space>
      }
    }
  ]

  return (
    <ModuleContent>
      <ContentHeader
        title={'Productos'}
        loading={loading}
        onRefresh={() => setReload(!reload)}
        tools={<Space>
          <Tooltip title={'Gestionar almacenes'}>
            <IconButton icon={<PiShippingContainer/>} onClick={() => setOpenWarehouseManager(true)}/>
          </Tooltip>
        </Space>}
        onAdd={() => setOpenAddProduct(true)}/>
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
        <Form.Item name={'group'} label={'Grupo'}>
          <ProductGroupsSelector/>
        </Form.Item>
        <Form.Item name={'brand'}>
          <ProductBrandSelector/>
        </Form.Item>
        <Form.Item name={'manufacturer'}>
          <ProductManufacturerSelector/>
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
          size={"small"} total={pagination.total}
          showTotal={(total) => `${total} productos en total`}
          pageSize={pagination.per_page}
          current={pagination.current_page}/>
      )}
      <ModalView
        width={900}
        open={openAddProduct}
        onCancel={() => {
          setOpenAddProduct(false);
          setSelectedProduct(undefined);
        }}>
        <ProductForm product={selectedProduct} onComplete={() => {
          setReload(!reload);
          setOpenAddProduct(false);
          setSelectedProduct(undefined);
        }}/>
      </ModalView>
      <ModalView width={800} open={openStockManager} onCancel={() => {
        setOpenStockManager(false);
        setSelectedProduct(undefined);
      }}>
        {selectedProduct && <ProductStockManager product={selectedProduct}/>}
      </ModalView>
      <ModalView width={700} open={openWarehouseManager} onCancel={() => {
        setOpenWarehouseManager(false);
        setSelectedProduct(undefined);
      }}>
        <WarehouseManager/>
      </ModalView>
    </ModuleContent>
  );
};

export default WarehouseProductsManager;
