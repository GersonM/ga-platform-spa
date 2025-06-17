import React from 'react';
import {Col, Divider, Form, Input, Row, Select} from "antd";
import axios from "axios";

import type {StorageProduct} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import ProductBrandSelector from "../ProductBrandSelector";
import ProductManufacturerSelector from "../ProductManufacturerSelector";
import ProductGroupsSelector from "../ProductGroupsSelector";
import ProductUnitTypesSelector from "../ProductUnitTypesSelector";

interface ProductFormProps {
  product?: StorageProduct;
  onComplete?: () => void;
}

const ProductForm = ({product, onComplete}: ProductFormProps) => {

  const submit = (values: any) => {
    axios
      .request({
        url: product ? `warehouses/products/${product.uuid}` : "warehouses/products",
        method: product ? 'PUT' : 'POST',
        data: values
      })
      .then(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form layout="vertical" initialValues={product} onFinish={submit}>
      <h2>{product ? 'Editar producto' : 'Crear Producto'}</h2>
      <Form.Item label="Nombre" name={'name'}>
        <Input/>
      </Form.Item>
      <Form.Item label="Descripción" name={'description'}>
        <Input.TextArea/>
      </Form.Item>
      <Row gutter={[15, 15]}>
        <Col md={12}>
          <Form.Item label="Tipo de unidad" name={'unit_type'}>
            <ProductUnitTypesSelector/>
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item label="Código" name={'code'}>
            <Input/>
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item label="Grupo" name={'group'}>
            <ProductGroupsSelector/>
          </Form.Item>
        </Col>
      </Row>
      <Divider>Información adicional</Divider>
      <Row gutter={[15, 15]}>
        <Col md={12}>
          <Form.Item label="Marca" name={'brand'}>
            <ProductBrandSelector/>
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item label="Modelo" name={'model'}>
            <Input/>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Fabricante/Proveedor" name={'manufacturer'}>
        <ProductManufacturerSelector/>
      </Form.Item>
      <Divider>Avanzado</Divider>
      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default ProductForm;
