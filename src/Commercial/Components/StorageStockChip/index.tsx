import React from 'react';
import type {StorageStock} from "../../../Types/api.tsx";
import {Space} from "antd";

interface StorageStockChipProps {
  storageStock?: StorageStock;
  quantity?: number;
}

const StorageStockChip = ({storageStock, quantity}: StorageStockChipProps) => {
  return (
    <div>
      <Space>
        <div>
          <code>{storageStock?.sku}</code>
          <small>{storageStock?.variation_name || storageStock?.product?.name}</small>
        </div>
        {quantity !== undefined && (
          <div>
            x<code>{quantity}</code>
          </div>
        )}
      </Space>
    </div>
  );
};

export default StorageStockChip;
