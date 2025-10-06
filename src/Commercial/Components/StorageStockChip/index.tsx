import React from 'react';
import {Space} from "antd";
import type {StorageStock} from "../../../Types/api.tsx";

interface StorageStockChipProps {
  storageStock?: StorageStock;
  quantity?: number;
  showQuantity?: boolean;
}

const StorageStockChip = ({storageStock, quantity, showQuantity = true}: StorageStockChipProps) => {
  return (
    <Space>
      <div>
        <code style={{fontSize: 13}}>{storageStock?.variation?.sku}</code>
        <small>{storageStock?.variation?.variation_name || storageStock?.variation?.product?.name}</small>
      </div>
      {showQuantity && quantity !== undefined && quantity > 1 && (
        <code>x{quantity}</code>
      )}
    </Space>
  );
};

export default StorageStockChip;
