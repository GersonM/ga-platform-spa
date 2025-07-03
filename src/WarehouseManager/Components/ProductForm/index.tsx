import React, { useState, useEffect } from 'react';
import {Col, Divider, Form, Input, Row, message, Button, Space} from "antd";
import axios from "axios";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

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

interface MetadataField {
  key: string;
  value: string;
  id: string;
}

const ProductForm = ({product, onComplete}: ProductFormProps) => {
  const [form] = Form.useForm();
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);

  useEffect(() => {
    if (product?.metadata) {
      try {
        const parsedMetadata = typeof product.metadata === 'string'
          ? JSON.parse(product.metadata)
          : product.metadata;

        const fields = Object.entries(parsedMetadata || {}).map(([key, value], index) => ({
          key,
          value: String(value),
          id: `field_${index}`
        }));

        setMetadataFields(fields.length > 0 ? fields : [{ key: '', value: '', id: 'field_0' }]);
      } catch (error) {
        console.error('Error parsing metadata:', error);
        setMetadataFields([{ key: '', value: '', id: 'field_0' }]);
      }
    } else {
      setMetadataFields([{ key: '', value: '', id: 'field_0' }]);
    }
  }, [product]);

  const addField = () => {
    const newId = `field_${Date.now()}`;
    setMetadataFields([...metadataFields, { key: '', value: '', id: newId }]);
  };

  const removeField = (id: string) => {
    if (metadataFields.length > 1) {
      setMetadataFields(metadataFields.filter(field => field.id !== id));
    }
  };

  const updateField = (id: string, type: 'key' | 'value', newValue: string) => {
    setMetadataFields(metadataFields.map(field =>
      field.id === id ? { ...field, [type]: newValue } : field
    ));
  };

  const buildMetadataObject = () => {
    const metadata: Record<string, string> = {};
    metadataFields.forEach(field => {
      if (field.key.trim() && field.value.trim()) {
        metadata[field.key.trim()] = field.value.trim();
      }
    });
    return metadata;
  };

  const submit = (values: any) => {
    const metadata = buildMetadataObject();

    const formData = {
      ...values,
      metadata: JSON.stringify(metadata)
    };

    axios
      .request({
        url: product ? `warehouses/products/${product.uuid}` : "warehouses/products",
        method: product ? 'PUT' : 'POST',
        data: formData
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
    <Form
      form={form}
      layout="vertical"
      initialValues={product}
      onFinish={submit}
    >
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
      <Form.Item label="Fabricante" name={'manufacturer'}>
        <ProductManufacturerSelector/>
      </Form.Item>

      <Divider>Avanzado</Divider>

      <Form.Item label="Metadata (Información técnica adicional)">
        <div style={{ marginBottom: '16px' }}>
          {metadataFields.map((field, index) => (
            <Row key={field.id} gutter={8} style={{ marginBottom: '8px' }}>
              <Col span={10}>
                <Input
                  placeholder="Campo (ej: categoria)"
                  value={field.key}
                  onChange={(e) => updateField(field.id, 'key', e.target.value)}
                />
              </Col>
              <Col span={12}>
                <Input
                  placeholder="Valor (ej: informatica)"
                  value={field.value}
                  onChange={(e) => updateField(field.id, 'value', e.target.value)}
                />
              </Col>
              <Col span={2}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeField(field.id)}
                  disabled={metadataFields.length === 1}
                  style={{ height: '32px' }}
                />
              </Col>
            </Row>
          ))}

          <Button
            type="dashed"
            onClick={addField}
            icon={<PlusOutlined />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Agregar campo
          </Button>
        </div>

        <small style={{ color: '#a6a6a6', display: 'block', lineHeight: '1.4' }}>
          <strong>Agrega información técnica adicional del producto.</strong>
          <br />
          Campos sugeridos: categoria, peso, dimensiones, color, material, garantia, especificaciones tecnicas.
        </small>
      </Form.Item>

      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default ProductForm;
