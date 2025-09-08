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
    <div>
      <Space>
        <div>
          <code style={{fontSize:13}}>{storageStock?.sku}</code>
          <small>{storageStock?.variation_name || storageStock?.product?.name}</small>
        </div>
        {showQuantity && quantity !== undefined && quantity > 1 && (
          <code>x{quantity}</code>
        )}
      </Space>
    </div>
  );
};

export default StorageStockChip;
