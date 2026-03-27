import type {ApiFile, EntityFieldValue, StorageStock, StorageWarehouse} from '../../../Types/api.tsx'
import CustomTag from '../../../CommonUI/CustomTag'
import StockStatus from '../../Components/ProductStockManager/StockStatus.tsx'
import StorageStockChip from '../../../Commercial/Components/StorageStockChip'
import AttributesList from '../../../EntityFields/Components/AttributesList'
import MoneyString from '../../../CommonUI/MoneyString'

import {Image, Popover, Space, Tooltip} from 'antd'
import {TbMapPin} from 'react-icons/tb'
import pluralize from 'pluralize'

const useStockColumns = () => {
  const coverCol = {
    title: 'Portada',
    dataIndex: 'attachments',
    width: 60,
    render: (attachments?: ApiFile[]) => {
      const cover = attachments?.filter(f => f.code == 'cover')
      return cover?.length ? <Image preview={false} src={cover[0].thumbnail} style={{
        width: 50,
        height: 50,
        overflow: 'hidden',
        objectFit: 'cover',
        borderRadius: 8,
      }}/> : <small>Sin imagen</small>
    },
  }

  const serialNumberCol = {
    title: 'N° Serie / ID',
    dataIndex: 'serial_number',
    width: 100,
    render: (serial_number: string) => {
      return <code><small style={{lineBreak:'anywhere'}}>{serial_number}</small></code>
    },
  }

  const typeCol = {
    title: 'Tipo',
    width: 80,
    dataIndex: 'type_label',
    render: (type_label: string | null, row: StorageStock) => {
      return type_label && <CustomTag color={row.type == 'rent' ? 'orange' : 'blue'}>
        <code>{type_label}</code>
      </CustomTag>
    },
  }

  const statusCol = {
    title: 'Estado',
    dataIndex: 'status',
    width: 100,
    render: (status: string) => {
      return <StockStatus status={status}/>
    },
  }

  const productCol = {
    title: 'Producto',
    dataIndex: 'uuid',
    render: (_uuid: string, row: StorageStock) => <>
      <StorageStockChip storageStock={row}/>
    </>,
  }

  const locationCol = {
    title: 'Ubicación',
    dataIndex: 'warehouse',
    width: 130,
    render: (warehouse: StorageWarehouse, row: StorageStock) => {
      const link = row.distribution_coordinate ? `https://www.google.com/maps/@${row.distribution_coordinate.lat},${row.distribution_coordinate.lng},761m/data=!3m1!1e3?entry=ttu` : null
      return <Space>
        <div>
          {warehouse?.name} <br/>
          <small>{warehouse?.address}</small>
        </div>
        <div>
          {
            link && <>
              <Tooltip
                title={`Ubicación lat: ${row.distribution_coordinate?.lat} lng: ${row.distribution_coordinate?.lng}`}>
                <a href={link} target={'_blank'} rel={'noreferrer'}><TbMapPin size={20}/></a>
              </Tooltip>
            </>
          }
        </div>
      </Space>
    },
  }

  const quantityCol = {
    title: 'Cantidad',
    dataIndex: 'is_consumable',
    render: (is_consumable: boolean, row: StorageStock) =>
      is_consumable ?
        pluralize(row.variation?.product?.unit_type || 'unidad', row.quantity, true) :
        <CustomTag>Sin límite</CustomTag>,
  }

  const attributesCol = {
    dataIndex: 'attributes',
    width: 220,
    title: 'Atributos',
    render: (attributes: EntityFieldValue[]) => {
      return <AttributesList attributes={attributes}/>
    },
  }

  const salePriceCol = {
    title: 'Precio de venta',
    dataIndex: 'sale_price',
    render: (sale_price: number, row: StorageStock) => {
      const earn = (row.sale_price || 0) - (row.cost_price || 0)
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
      </>
    },
  }

  const getColumns = (tenant?: string) => {
    switch (tenant) {
      case 'candares':
      case 'palmadelrio':
      case 'demo':
        return [
          coverCol,
          serialNumberCol,
          typeCol,
          statusCol,
          productCol,
          locationCol,
          attributesCol,
          salePriceCol,]
      default:
        return [
          serialNumberCol,
          typeCol,
          statusCol,
          productCol,
          locationCol,
          attributesCol,
          salePriceCol,
        ];
    }
  }

  return {getColumns}
}

export default useStockColumns
