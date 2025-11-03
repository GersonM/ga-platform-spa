import React from 'react';
import {Space} from "antd";
import type {StorageStock} from "../../../Types/api.tsx";
import {TbChevronRight} from "react-icons/tb";

interface StorageStockChipProps {
  storageStock?: StorageStock;
  quantity?: number;
  showQuantity?: boolean;
}

const StorageStockChip = ({storageStock, quantity, showQuantity = true}: StorageStockChipProps) => {
  const name = storageStock?.name || <>{storageStock?.variation?.product?.name} <TbChevronRight size={10}/> {storageStock?.variation?.name}</>;
  return (
    <Space>
      <div>
        {name || 'Sin nombre'}
        <small>
          <code style={{fontSize: 13}}>{storageStock?.serial_number}</code>
        </small>
      </div>
      {showQuantity && quantity !== undefined && quantity > 1 && (
        <code>x{quantity}</code>
      )}
    </Space>
  );
};

export default StorageStockChip;
