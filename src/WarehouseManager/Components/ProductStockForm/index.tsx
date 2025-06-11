import React, {useEffect, useState} from 'react';
import {Checkbox, Col, Form, Input, Row, Select} from "antd";
import axios from "axios";

import type {StorageProduct, StorageStock} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ProductGroupsSelector from "../ProductGroupsSelector";
import ErrorHandler from "../../../Utils/ErrorHandler";
import ProductSelector from "../ProductSelector";
import WarehouseSelector from "../WarehouseSelector";
import {useForm} from "antd/lib/form/Form";

interface ProductStockFormProps {
  stock?: StorageStock;
  product?: StorageProduct;
  onComplete?: () => void;
}

const ProductStockForm = ({product, stock, onComplete}: ProductStockFormProps) => {
  const [form] = useForm();

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [stock, form]);

  const submit = (values: any) => {
    const data = {
      ...values,
      product_uuid: product ? product.uuid : values.product_uuid,
      cost_price: values.cost_price * 100,
      sale_price: values.sale_price * 100,
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
      <Row gutter={[15, 15]}>
        <Col md={8}>
          <Form.Item label="Producto" name={'product_uuid'}>
            {product ?
              <>{product.name} <br/> <small style={{marginTop: -4, display: 'block'}}>{product.code}</small></>
              : <ProductSelector/>}
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item label="SKU" name={'sku'}>
            <Input/>
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item label="Almacen" name={'warehouse_uuid'}>
            <WarehouseSelector/>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[15, 15]}>
        <Col md={8}>
          <Form.Item label="Costo" name={'cost_price'}>
            <Input/>
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item label="Venta" name={'sale_price'}>
            <ProductGroupsSelector/>
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item label="Estado" name={'status'}>
            <Select
              placeholder={'Estado'}
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
      <Form.Item label="Observaciones (opcional)" name={'description'}>
        <Input.TextArea/>
      </Form.Item>
      <Form.Item label="Es consumible?" name={'is_consumable'}>
        <Checkbox defaultChecked>
          Solo puede ser vendido una vez
        </Checkbox>
      </Form.Item>
      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default ProductStockForm;
