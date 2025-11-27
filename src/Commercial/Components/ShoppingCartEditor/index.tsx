import React, {useEffect, useState} from 'react';
import {Col, Empty, Form, InputNumber, Row, Tag} from "antd";
import {TbCheck, TbTrash} from "react-icons/tb";

import MoneyInput from "../../../CommonUI/MoneyInput";
import IconButton from "../../../CommonUI/IconButton";
import type {StorageContractCartItem, StorageStock} from "../../../Types/api.tsx";
import './styles.less';
import StockSelector from "../../../WarehouseManager/Components/StockSelector";
import MoneyString from "../../../CommonUI/MoneyString";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

interface ShoppingCartEditorProps {
  onChange?: (value: StorageContractCartItem[]) => void;
  value?: StorageContractCartItem[];
  liveUpdate?: boolean;
}

const ShoppingCartEditor = ({onChange, value, liveUpdate = true}: ShoppingCartEditorProps) => {
  const [shoppingCart, setShoppingCart] = useState<StorageContractCartItem[]>([]);

  useEffect(() => {
    if (value) {
      setShoppingCart(value);
    }
  }, [value]);

  useEffect(() => {
    if (onChange && shoppingCart && liveUpdate) {
      onChange(shoppingCart);
    }
  }, [shoppingCart])

  const updateQuantity = (data: StorageContractCartItem, quantity: number | null) => {
    const newCart = [...shoppingCart];
    if (newCart) {
      const index = newCart.findIndex(i => i.stock?.uuid === data.stock?.uuid);
      if (index !== -1) {
        newCart[index].quantity = quantity || 1;
        setShoppingCart(newCart);
      }
    }
  }

  const updateAmount = (data: StorageContractCartItem, amount?: number) => {
    const newCart = [...shoppingCart];
    if (newCart) {
      const index = newCart.findIndex(i => i.stock?.uuid === data.stock?.uuid);
      if (index !== -1) {
        newCart[index].unit_amount = amount != null ? amount : (data.stock?.sale_price || 0);
        setShoppingCart(newCart);
      }
    }
  }

  const removeStock = (data: StorageContractCartItem) => {
    const newCart = [...shoppingCart];
    if (newCart) {
      const index = newCart.findIndex(i => i.stock?.uuid === data.stock?.uuid);
      if (index !== -1) {
        newCart.splice(index, 1);
        setShoppingCart(newCart);
      }
    }
  }

  const addStock = (data: StorageStock) => {
    const newCart = [...shoppingCart];
    const index = newCart.findIndex(i => i.stock?.uuid === data.uuid);
    if (index !== -1) {
      newCart[index].quantity++;
    } else {
      newCart.push({uuid: 'new_'+(Math.random() * 10).toString(), unit_amount: null, quantity: 1, stock: data});
    }
    setShoppingCart(newCart);
  }

  const cartTotalAmountPen = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.unit_amount != null ? item.unit_amount : (item.stock?.sale_price || 0));
    return s + (item.stock?.currency == 'PEN' ? itemAmount : 0);
  }, 0);

  const cartTotalAmountUSD = shoppingCart.reduce((s, item) => {
    const itemAmount = (item.quantity || 1) * (item.unit_amount != null ? item.unit_amount : (item.stock?.sale_price || 0));
    return s + (item.stock?.currency == 'USD' ? itemAmount : 0);
  }, 0);

  return (
    <>
      <div className={'shopping-cart-editor-container'}>
        <Row gutter={[15, 15]}>
          <Col xs={14}>
            <Form.Item label={'Agregar producto'}>
              <StockSelector value={null} onChange={(_uuid, option) => {
                addStock(option.entity);
              }}/>
            </Form.Item>
          </Col>
          <Col xs={10}>
            <Form.Item label={'Total'}>
              {cartTotalAmountPen > 0 &&
                <Tag bordered={false} color={'blue'}>
                  <MoneyString currency={'PEN'} value={cartTotalAmountPen}/>
                </Tag>
              }
              {cartTotalAmountUSD > 0 &&
                <Tag bordered={false} color={'green'}>
                  <MoneyString currency={'USD'} value={cartTotalAmountUSD}/>
                </Tag>
              }
            </Form.Item>
          </Col>
        </Row>
        {!shoppingCart?.length &&
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Elige un producto para agregarlo'}/>}
        {shoppingCart?.map((cartItem, index) => {
          const name = cartItem.stock?.name || (((cartItem.stock?.variation?.product?.name + ' ') || '') + (cartItem.stock?.variation?.name || ''));
          return <div className={'shopping-cart-item'} key={index}>
            <div className={'name'}>
              {name}
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
      <br/>
      <PrimaryButton
        icon={<TbCheck/>}
        label={'Guardar cambios'} block onClick={() => {
        if (onChange) {
          onChange(shoppingCart);
        }
      }}/>
    </>

  );
};

export default ShoppingCartEditor;
