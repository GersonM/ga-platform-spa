import React from 'react';
import {Tag} from "antd";

interface StockStatusProps {
  status: string;
}

const statuses: any = {
  available: 'Disponible',
  sold: 'Vendido',
  reserved: 'Reservado',
  damaged: 'Dañado',
  in_transportation: 'En transporte',
}

const colors: any = {
  reserved: 'orange',
  damaged: 'red',
  sold: 'blue',
  in_transportation: 'yellow',
  available: 'green',
}

const StockStatus = ({status}: StockStatusProps) => {
  return (
      <Tag style={{marginRight:0}} bordered={false} color={colors[status]}>{statuses[status]}</Tag>
  );
};

export default StockStatus;
