import React, {useContext, useEffect, useState} from 'react';
import {TbArchive, TbArchiveOff, TbMapPin, TbPencil, TbRecycle, TbRecycleOff, TbShredder} from "react-icons/tb";
import {
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Pagination,
  Popover,
  Progress,
  Select,
  Space,
  Table,
  Tooltip
} from "antd";
import dayjs from "dayjs";
import pluralize from "pluralize";
import axios from "axios";

import type {
  Point,
  ResponsePagination, StorageProduct, StorageProductVariation,
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
import ProductSelector from "../../Components/ProductSelector";
import StockSelector from "../../Components/StockSelector";
import FileDownloader from "../../../CommonUI/FileDownloader";

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
  const [filterWarehouse, setFilterWarehouse] = useState<StorageWarehouse>();
  const [filterProduct, setFilterProduct] = useState<StorageProduct>();
  const [filterVariation, setFilterVariation] = useState<StorageProductVariation>();
  const [selectedRows, setSelectedRows] = useState<string[]>();
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [tempURL, setTempURL] = useState<string>();
  const [openArchiveStock, setOpenArchiveStock] = useState(false);

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

  const archiveStock = (values: any) => {
    axios.post(`warehouses/stock/${selectedStock?.uuid}/retire-from-sale`, values)
      .then(() => {
        setReload(!reload);
        setOpenArchiveStock(false);
        setSelectedStock(undefined);
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
      title: 'Lo',
      dataIndex: 'distribution_coordinate',
      render: (distribution_coordinate:Point) => {
        if(!distribution_coordinate) return;
        const link = `https://www.google.com/maps/@${distribution_coordinate.lat},${distribution_coordinate.lng},761m/data=!3m1!1e3?entry=ttu`;
        return <Tooltip title={`Ubicación lat: ${distribution_coordinate.lat} lng: ${distribution_coordinate.lng}`}>
          <a href={link} target={'_blank'} rel={'noreferrer'}><TbMapPin size={20} /></a>
        </Tooltip>;
      }
    },
    {
      title: 'Tipo',
      dataIndex: 'type_label',
      render: (type_label: string | null, row: StorageStock) => {
        return type_label && <CustomTag color={row.type == 'rent' ? 'orange' : 'blue'}>
          <code>{type_label}</code>
        </CustomTag>;
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
        const isDamaged = stock.status == 'damaged';
        const isArchived = stock.status == 'not_available';
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
          <Tooltip title={isDamaged ? 'Recuperar stock' : 'Registrar como dañado'}>
            <IconButton
              small icon={isDamaged ? <TbRecycle color={'green'}/> : <TbRecycleOff/>}
              danger={!isDamaged}
              onClick={() => deleteStock(uuid)}/>
          </Tooltip>
          {stock.status == 'available' &&
            <Tooltip title={isArchived ? 'Recuperar' : 'Retirar'}>
              <IconButton
                small icon={isArchived ? <TbArchiveOff color={'green'}/> : <TbArchive/>}
                onClick={() => {
                  setSelectedStock(stock);
                  setOpenArchiveStock(true);
                }}/>
            </Tooltip>
          }
        </Space>;
      }
    }
  ]

  const getStockReport = () => {
    setDownloadingReport(true);
    axios({
      url: "/warehouses/stock/report",
      method: 'GET',
      params: {
        selected_stock: selectedRows,
      },
      responseType: 'blob',
    })
      .then(response => {
        setDownloadingReport(false);
        if (response) {
          const url = window.URL.createObjectURL(response.data);
          setTempURL(url);
        }
      })
      .catch(e => {
        setDownloadingReport(false);
        ErrorHandler.showNotification(e);
      });
  };

  const percent = stockStats ? (stockStats.sold / stockStats.total) * 100 : 0;

  return (
    <ModuleContent>
      <ContentHeader
        onRefresh={() => setReload(!reload)}
        onAdd={() => {
          setOpenStockForm(true);
          setSelectedStock(undefined);
        }}
        loading={loading}
        title={'Existencias'}
        tools={<>
          {stockStats?.sold} vendidos de {stockStats?.total} | {stockStats?.available} disponibles
          <Progress percent={Math.round(percent)} style={{width: '200px'}}/>
          <PrimaryButton disabled={!selectedRows?.length} loading={downloadingReport} label={'Generar reporte'}
                         onClick={() => setOpenStockReport(true)}/>
          <PrimaryButton disabled loading={downloadingReport} label={'Registrar salidas'} onClick={getStockReport}/>
        </>}
      >
        <FilterForm
          onSubmit={values => setFilters(values)}
          onInitialValues={values => setFilters(values)}
          additionalChildren={
            <>
              <Form.Item layout={'vertical'} label={'Producto'} name={'product_uuid'}>
                <ProductSelector warehouse={filterWarehouse}
                                 onChange={(_v, option) => setFilterProduct(option.entity)}/>
              </Form.Item>
              <Form.Item layout={'vertical'} label={'Variación'} name={'variation_uuid'}>
                <ProductVariationSelector product={filterProduct}
                                          onChange={(_v, option) => setFilterVariation(option.entity)}/>
              </Form.Item>
              <Form.Item layout={'vertical'} label={'Stock'} name={'stock_uuid'}>
                <StockSelector product={filterProduct} variation={filterVariation} status={'sold'}/>
              </Form.Item>
            </>
          }
        >
          <Form.Item label="Buscar" name={'search'}>
            <Input placeholder={'Buscar por nombre o N° de serie'}/>
          </Form.Item>
          <Form.Item label="Estado" name={'status'}>
            <Select
              allowClear
              placeholder={'Disponible'}
              popupMatchSelectWidth={false}
              onChange={value => {
                setStockState(value);
              }} options={[
              {label: 'Disponible', value: 'available'},
              {label: 'No disponibles', value: 'not_available'},
              {label: 'Vendidos', value: 'sold'},
              {label: 'Reservados', value: 'reserved'},
              {label: 'Dañados', value: 'damaged'},
              {label: 'Todos', value: 'all'},
            ]}/>
          </Form.Item>
          <Form.Item label={'Ubicación'} name={'warehouse_uuid'}>
            <WarehouseSelector onChange={(_v, option) => setFilterWarehouse(option.entity)}/>
          </Form.Item>
          <Form.Item label={'Desde'} name={'sale_price_from'}>
            <InputNumber/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>
      <FileDownloader
        name={'Imprimir brochure'}
        url={'document-generator/stock-brochure'}
        data={{selected_stock: selectedRows}}
        open={openStockReport}
        onComplete={() => {
          setOpenStockReport(false);
        }}
      />
      <Table
        scroll={{x: 900}}
        rowSelection={{
          onChange: (rows: any[]) => {
            setSelectedRows(rows);
          }
        }}
        pagination={false} rowKey={'uuid'} size={"middle"} loading={loading}
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
        width={1100}
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
      <ModalView open={openArchiveStock} onCancel={() => setOpenArchiveStock(false)}>
        <h3>Archivar stock</h3>
        <p>Al retirar el stock no se elimina ninguna información relacionada, pero no estará disponible para ventas
          futuras ni en el catalogo</p>
        <StorageStockChip storageStock={selectedStock}/>
        <Divider/>
        <Form layout={'vertical'} onFinish={archiveStock}>
          <Form.Item label={'Motivo del retiro (opcional)'} name={'comment'}>
            <Input.TextArea/>
          </Form.Item>
          <PrimaryButton label={'Retirar'} htmlType={'submit'} block/>
        </Form>
      </ModalView>
      <ModalView
        width={1200}
        title={'Reporte de inventario'}
        open={!!tempURL}
        onCancel={() => {
          setTempURL(undefined);
        }}>
        {tempURL && <iframe src={tempURL} height={600} width={'100%'} style={{border: 0}}></iframe>}
      </ModalView>
    </ModuleContent>
  );
};

export default WarehouseStockManager;
