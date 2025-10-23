import React from 'react';
import {Space} from "antd";
import type {StorageStock} from "../../../Types/api.tsx";

interface StorageStockChipProps {
  storageStock?: StorageStock;
  quantity?: number;
  showQuantity?: boolean;
}

const StorageStockChip = ({storageStock, quantity, showQuantity = true}: StorageStockChipProps) => {
  const name = storageStock?.name || (storageStock?.variation?.product?.name + ' ' + (storageStock?.variation?.variation_name || ''));
  return (
    <Space>
      <div>
        {name || 'Sin nombre'}
        <small>
          <code style={{fontSize: 13}}>{storageStock?.variation?.sku || 'No SKU'}</code>
        </small>
      </div>
      {showQuantity && quantity !== undefined && quantity > 1 && (
        <code>x{quantity}</code>
      )}
    </Space>
  );
};

export default StorageStockChip;
