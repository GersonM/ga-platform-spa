import React from 'react';
import {Descriptions, DescriptionsProps, Divider} from 'antd';
import {StorageStock} from '../../../Types/api';

interface StockViewerStateProps {
  stock: StorageStock;
}

const StockViewerState = ({stock}: StockViewerStateProps) => {
  const items: DescriptionsProps['items'] = [
    {key: '4', label: 'SKU', span: 2, children: stock?.sku},
    {key: '5', label: 'Estado', children: <p>{stock?.status}</p>},
    {key: '1', label: 'Etapa', children: stock?.metadata?.etapa},
    {key: '2', label: 'Mz', children: stock?.metadata?.manzana},
    {key: '3', label: 'Lote', children: stock?.metadata?.lote},
  ];

  const itemsProduct: DescriptionsProps['items'] = [
    {key: '10', label: 'Área', children: stock?.product?.metadata?.area + ' m2'},
    {
      key: '11',
      label: 'Módulo',
      children: stock?.product?.metadata?.module ? stock?.product?.metadata?.module + ' m2' : 'Sin módulo',
    },
    {key: '12', label: 'Frente', children: stock?.product?.metadata?.front + 'm'},
    {key: '13', label: 'Izquierda', children: stock?.product?.metadata?.left + 'm'},
    {key: '14', label: 'Derecha', children: stock?.product?.metadata?.right + 'm'},
    {key: '15', label: 'Fondo', children: <p>{stock?.product?.metadata?.back} m</p>},
    {key: '16', label: 'Habitaciones', children: <p>{stock?.product?.metadata?.rooms}</p>},
  ];
  return (
    <div>
      <Descriptions title="Dirección" items={items} />
      <Divider />
      <Descriptions layout={'vertical'} size={'small'} title="Dimensiones" items={itemsProduct} />
    </div>
  );
};

export default StockViewerState;
