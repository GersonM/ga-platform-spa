import React from 'react';
import type {StorageContractCartItem} from "../../../Types/api.tsx";
import {Form, Input, InputNumber} from "antd";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import MoneyInput from "../../../CommonUI/MoneyInput";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import StorageStockChip from "../StorageStockChip";
import StockSelector from "../../../WarehouseManager/Components/StockSelector";

interface CartItemForProps {
  cartItem: StorageContractCartItem;
  onComplete?: () => void;
}

const CartItemForm = ({cartItem, onComplete}: CartItemForProps) => {

  const onSubmit = (values: any) => {
    axios.put(`commercial/cart-items/${cartItem.uuid}`, values)
      .then(() => {
        if (onComplete) onComplete();
      })
      .catch((error: any) => {
        ErrorHandler.showNotification(error);
      })
  }

  return (
    <Form initialValues={cartItem} onFinish={onSubmit} layout="vertical">
      <p>Editar el monto y la cantidad no afectará a los requerimientos de pagos ya generados</p>
      <StorageStockChip storageStock={cartItem.stock}/>
      <Form.Item name={'fk_stock_uuid'} label={'Producto'}>
        <StockSelector  />
      </Form.Item>
      <Form.Item name={'quantity'} label={'Cantidad'}>
        <InputNumber/>
      </Form.Item>
      <Form.Item name={'unit_amount'} label={'Precio unitario'}>
        <MoneyInput currency={cartItem.stock?.currency}
                    placeholder={(cartItem.unit_amount || cartItem.stock?.sale_price) + ''}/>
      </Form.Item>
      <PrimaryButton htmlType={'submit'} label={'Guardar'} block/>
    </Form>
  );
};

export default CartItemForm;
