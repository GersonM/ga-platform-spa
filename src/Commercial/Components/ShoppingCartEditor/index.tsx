import React, {useEffect, useState} from 'react';
import {InputNumber, List, Space} from "antd";
import {TbTrash} from "react-icons/tb";

import MoneyInput from "../../../CommonUI/MoneyInput";
import IconButton from "../../../CommonUI/IconButton";
import type {StorageContractCartItem} from "../../../Types/api.tsx";
import './styles.less';

interface ShoppingCartEditorProps {
  onChange?: (value: any) => void;
  value?: StorageContractCartItem[];
}

const ShoppingCartEditor = ({onChange, value}: ShoppingCartEditorProps) => {
  const [shoppingCart, setShoppingCart] = useState<StorageContractCartItem[] | undefined>(value);

  useEffect(() => {
    setShoppingCart(value);
  }, [value])

  const updateQuantity = (data: StorageContractCartItem, quantity: number | null) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].quantity = quantity || 1;
      setShoppingCart(newCart);
    }
  }

  const updateAmount = (data: StorageContractCartItem, amount?: number) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].unit_amount = amount != null ? amount : (data.stock?.sale_price || 0);
      setShoppingCart(newCart);
    }
  }

  const removeStock = (data: StorageContractCartItem) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.uuid === data.uuid);
    if (index !== -1) {
      newCart.splice(index, 1);
      setShoppingCart(newCart);
    }
  }

  return (
    <div className={'shopping-cart-editor-container'}>
      {shoppingCart?.map((cartItem, index) => {
        const name = cartItem.stock?.name || (((cartItem.stock?.variation?.product?.name + ' ') || '') + cartItem.stock?.variation?.name);
        return <div className={'shopping-cart-item'}>
          <div className={'name'}>
            {name} <br/>
            <small><code>{cartItem.stock?.serial_number}</code></small>
          </div>
          <InputNumber
            value={cartItem.quantity}
            min={1} max={999} addonBefore={'Cant.'} placeholder={'1'} style={{width: 110}}
            onChange={v => {
              updateQuantity(cartItem, v);
            }}/>
          <MoneyInput
            min={0}
            width={140}
            value={cartItem.unit_amount || undefined}
            block={false} currency={cartItem.stock?.currency}
            placeholder={cartItem.stock?.sale_price ? (cartItem.stock?.sale_price / 100).toString() : '0'}
            onChange={v => {
              updateAmount(cartItem, v);
            }}
          />
          <IconButton icon={<TbTrash/>} danger small onClick={() => removeStock(cartItem)}/>
        </div>
      })}
    </div>
  );
};

export default ShoppingCartEditor;
