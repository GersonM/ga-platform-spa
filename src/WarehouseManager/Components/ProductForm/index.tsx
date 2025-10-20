import React, {useState} from 'react';
import {Col, Divider, Form, Input, Row, notification} from "antd";
import axios from "axios";

import type {StorageProduct} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import ProductBrandSelector from "../ProductBrandSelector";
import ProductManufacturerSelector from "../ProductManufacturerSelector";
import ProductGroupsSelector from "../ProductGroupsSelector";
import ProductUnitTypesSelector from "../ProductUnitTypesSelector";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";
import HtmlEditor from "../../../CommonUI/HtmlEditor";

interface ProductFormProps {
  product?: StorageProduct;
  onComplete?: () => void;
  onChange?: () => void;
}

const ProductForm = ({product, onComplete, onChange}: ProductFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const submit = (values: any) => {
    setLoading(true);

    axios
      .request({
        url: product ? `warehouses/products/${product.uuid}` : "warehouses/products",
        method: product ? 'PUT' : 'POST',
        data: values
      })
      .then(() => {
        setLoading(false);
        notification.success({message: 'Información guardada', description: 'La información se guardo correctamente'});
        if (onComplete) {
          onComplete();
        }
      })
      .catch(err => {
        setLoading(false);
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={product}
      onValuesChange={() => setIsModified(true)}
      onFinish={submit}
    >
      <LoadingIndicator visible={loading} overlay/>
      <h2>{product ? 'Editar producto' : 'Registrar nuevo producto'}</h2>
      <Row gutter={[25, 25]}>
        <Col span={13}>
          <Form.Item label="Nombre" name={'name'}>
            <Input/>
          </Form.Item>
          <Form.Item label="Descripción corta" name={'excerpt'}>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item label="Descripción comercial" name={'description'}>
            <HtmlEditor />
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
        </Col>
        <Col span={11}>
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
          <Form.Item label="Fabricante" name={'manufacturer'}>
            <ProductManufacturerSelector/>
          </Form.Item>
          <Divider>Avanzado</Divider>

          <Form.Item label="Metadata (Información técnica adicional)" name={'attributes'}>
            <EntityFieldsEditor entity={product} onComplete={onChange} />
          </Form.Item>
        </Col>
      </Row>
      <PrimaryButton disabled={!isModified} loading={loading} block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default ProductForm;
