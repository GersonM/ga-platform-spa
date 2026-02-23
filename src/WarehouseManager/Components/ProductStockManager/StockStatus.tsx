import React from 'react';
import {Tag} from "antd";
import CustomTag from "../../../CommonUI/CustomTag";

interface StockStatusProps {
  status: string;
}

const statuses: any = {
  available: 'Disponible',
  not_available: 'No disponible',
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
  not_available: 'orange',
}

const StockStatus = ({status}: StockStatusProps) => {
  return (
      <CustomTag style={{marginRight:0}} color={colors[status]}>{statuses[status]}</CustomTag>
  );
};

export default StockStatus;
