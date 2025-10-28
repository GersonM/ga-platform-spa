import React, {useEffect, useState} from 'react';
import {Form, Input, Pagination, Space, Tooltip} from "antd";
import {PiShippingContainer} from "react-icons/pi";
import axios from "axios";
import dayjs from "dayjs";

import type {Profile, ResponsePagination, StorageProduct, StorageStock, StorageWarehouse} from "../../../Types/api.tsx";
import StockActivityActionChip from "../../../WarehouseManager/Components/StockActivityActionChip";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import IconButton from "../../../CommonUI/IconButton";
import FilterForm from "../../../CommonUI/FilterForm";
import ProductGroupsSelector from "../../../WarehouseManager/Components/ProductGroupsSelector";
import ProductBrandSelector from "../../../WarehouseManager/Components/ProductBrandSelector";
import ProductManufacturerSelector from "../../../WarehouseManager/Components/ProductManufacturerSelector";
import TableList from "../../../CommonUI/TableList";
import ModalView from "../../../CommonUI/ModalView";
import ProductForm from "../../../WarehouseManager/Components/ProductForm";
import ProductStockManager from "../../../WarehouseManager/Components/ProductStockManager";
import WarehouseManager from "../../../WarehouseManager/Components/WarehouseManager";
import CustomTag from "../../../CommonUI/CustomTag";

const MonitorServicesManager = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<StorageProduct[]>();
  const [reload, setReload] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StorageProduct>();
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
      title: 'ID',
      dataIndex: 'uuid',
      align: 'center',
      width: 100,
    },
    {
      title: 'Acción',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (text: string) => (<CustomTag color={'green'}>{text}</CustomTag>)
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      render: (text: string) => (<code>{text}</code>)
    },
    {
      title: 'Procesador',
      dataIndex: 'uuid',
      render: (text: string) => (
        <>
          AMD Ryzen 9 3900X 12-Core Processor
          <small>DDR4 3200MHz 64GB (2 x 32GB 3200MHz)</small>
        </>
      )
    },
    {
      title: 'Disco total',
      dataIndex: 'disk',
    },
    {
      title: 'Disco disponible',
      dataIndex: 'available_disk',
    },
    {
      title: 'Tiempo de servicio',
      dataIndex: 'uptime',
    },
    {
      title: 'Fecha de regisrto',
      width: 210,
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

  const data = [
    {
      status: 'online',
      uuid: "223596",
      ip: "74.50.77.162",
      name: "SV1",
      features: "AMD Ryzen 9 3900X 12-Core Processor",
      disk: "Samsung SSD 970 EVO Plus 2TB",
      available_disk: "213Gb",
      uptime: "12 días",
      created_at: "07-01-2025",
    },
    {
      status: 'online',
      uuid: "234csf",
      ip: "66.45.233.122",
      features: 'AMD Ryzen 5 3600X 6-Core Processor',
      memory: "DDR4 3200MHz 64GB (2 x 32GB 3200MHz)",
      name: "SV2",
      disk: "Crucial 1TB NVMe SN:2243E67E10C9 - Samsung SSD 970 EVO Plus 1TB SN:S59ANM0RC00743X",
      available_disk: "213Gb",
      uptime: "12 días",
      created_at: "06-21-2025",
    },
    {
      status: 'online',
      uuid: "234csf",
      ip: "74.50.75.242",
      name: "SV2",
      disk: "2Tb",
      available_disk: "213Gb",
      uptime: "12 días",
      created_at: "06-21-2025",
    },
    {
      status: 'online',
      uuid: "234csf",
      ip: "66.45.233.122",
      name: "SV2",
      disk: "2Tb",
      available_disk: "213Gb",
      uptime: "12 días",
      created_at: "06-21-2025",
    },
    {
      status: 'online',
      uuid: "134642",
      ip: "66.45.225.18",
      name: "SV2",
      disk: "2Tb",
      available_disk: "213Gb",
      uptime: "12 días",
      created_at: "06-21-2025",
    },
    {
      status: 'online',
      uuid: "105157",
      ip: "209.159.145.122",
      name: "SV2",
      disk: "2Tb",
      available_disk: "213Gb",
      uptime: "12 días",
      created_at: "06-21-2025",
    },
  ]

  return (
    <ModuleContent>
      <ContentHeader
        title={'Monitoreo de servicios'}
        loading={loading}
        largeTools
        onRefresh={() => setReload(!reload)}
        onAdd={() => setOpenAddProduct(true)}>
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
          <Form.Item name={'ip'} label={'IP'}>
            <ProductGroupsSelector/>
          </Form.Item>
          <Form.Item name={'manufacturer'}>
            <ProductManufacturerSelector/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <TableList customStyle={false} columns={columns} dataSource={data}/>
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
      <ModalView width={700} open={openWarehouseManager} onCancel={() => {
        setOpenWarehouseManager(false);
        setSelectedProduct(undefined);
      }}>
        <WarehouseManager/>
      </ModalView>
    </ModuleContent>
  );
};

export default MonitorServicesManager;
