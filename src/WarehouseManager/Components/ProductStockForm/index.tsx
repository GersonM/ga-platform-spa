import React, {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";

import type {StorageProduct, StorageStock} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import ProductSelector from "../ProductSelector";
import WarehouseSelector from "../WarehouseSelector";
import MoneyInput from "../../../CommonUI/MoneyInput";
import CurrencySelector from "../../../PaymentManagement/Components/CurrencySelector";

interface ProductStockFormProps {
  stock?: StorageStock;
  product?: StorageProduct;
  onComplete?: () => void;
}

const ProductStockForm = ({product, stock, onComplete}: ProductStockFormProps) => {
  const [form] = useForm();
  const [currentCurrency, setCurrentCurrency] = useState<string>();
  const [isConsumable, setIsConsumable] = useState(stock?.is_consumable);

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [stock, form]);

  const submit = (values: any) => {
    const data = {
      ...values,
      product_uuid: product ? product.uuid : values.product_uuid,
      cost_price: values.cost_price,
      sale_price: values.sale_price,
    }
    axios
      .request({
        url: stock ? `warehouses/stock/${stock.uuid}` : "warehouses/stock",
        method: stock ? 'PUT' : 'POST',
        data
      })
      .then(() => {
        form.resetFields();
        if (onComplete) {
          onComplete();
        }
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form form={form} layout="vertical" initialValues={stock} onFinish={submit}>
      <h2>{stock ? 'Editar stock' : 'Registrar stock'}</h2>
      <Form.Item label="Producto" name={'product_uuid'}>
        {product ?
          <div>
            {product.name} <small style={{marginTop: -4, display: 'block'}}>{product.code}</small>
          </div>
          : <ProductSelector/>}
      </Form.Item>
      <Row gutter={15}>
        <Col md={15} xs={13}>
          <Form.Item label="Nombre de la variación (opcional)" name={'variation_name'}>
            <Input placeholder={product?.name}/>
          </Form.Item>
        </Col>
        <Col md={9}>
          <Form.Item label="Estado" name={'status'}>
            <Select
              placeholder={'Disponible'}
              popupMatchSelectWidth={false}
              style={{width: '100%'}}
              options={[
                {label: 'Vendidos', value: 'sold'},
                {label: 'Disponible', value: 'available'},
                {label: 'Reservados', value: 'reserved'},
                {label: 'Merma', value: 'wasted'},
              ]}/>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={15}>
        <Col md={8} xs={12}>
          <Form.Item label="SKU" name={'sku'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
        </Col>
        <Col md={7} xs={12}>
          <Form.Item label="Almacen" initialValue={stock?.fk_warehouse_uuid} name={'warehouse_uuid'} rules={[{required: true}]}>
            <WarehouseSelector/>
          </Form.Item>
        </Col>
        <Col md={9} xs={24}>
          <Form.Item label="Fecha de vencimiento" name={'expiration_date'}>
            <DatePicker style={{width: '100%'}}/>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={15}>
        <Col md={6}>
          <Form.Item label="Moneda" name={'currency'}>
            <CurrencySelector defaultValue={'PEN'} onChange={(value: string) => setCurrentCurrency(value)}/>
          </Form.Item>
        </Col>
        <Col md={9}>
          <Form.Item label="Costo" name={'cost_price'}>
            <MoneyInput currency={currentCurrency || stock?.currency}/>
          </Form.Item>
        </Col>
        <Col md={9}>
          <Form.Item label="Venta" name={'sale_price'}>
            <MoneyInput currency={currentCurrency || stock?.currency}/>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Observaciones (opcional)" name={'description'}>
        <Input.TextArea/>
      </Form.Item>
      <Row gutter={15}>
        <Col md={14}>
          <Form.Item
            name={'is_consumable'}
            valuePropName={'checked'}
            help={isConsumable ? 'Solo puede ser vendido según la cantidad':'Puede ser vendido multiples veces'}>
            <Checkbox onChange={(value) => setIsConsumable(value.target.checked)}>
              Tiene stock limitado
            </Checkbox>
          </Form.Item>
        </Col>
        <Col md={10}>
          {isConsumable &&
            <Form.Item label="Cantidad" name={'quantity'}>
              <InputNumber defaultValue={1}/>
            </Form.Item>
          }
        </Col>
      </Row>
      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default ProductStockForm;
