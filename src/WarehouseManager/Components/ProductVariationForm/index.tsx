import React, {useEffect, useState} from 'react';
import {Col, Form, Input, InputNumber, Row, Select, Button, Divider, Image, Switch, Checkbox} from "antd";
import {useForm} from "antd/lib/form/Form";
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {DefaultEditor} from "react-simple-wysiwyg";
import axios from "axios";

import type {MetadataField, StorageProduct, StorageProductVariation} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import ProductSelector from "../ProductSelector";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";
import FileUploader from "../../../FileManagement/Components/FileUploader";

interface ProductVariationFormProps {
  variation?: StorageProductVariation;
  product?: StorageProduct;
  onComplete?: () => void;
}

const ProductVariationForm = ({product, variation, onComplete}: ProductVariationFormProps) => {
  const [form] = useForm();
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [variation, form]);

  useEffect(() => {
    if (variation?.metadata) {
      try {
        const parsedMetadata = typeof variation.metadata === 'string'
          ? JSON.parse(variation.metadata)
          : variation.metadata;
        if (Array.isArray(parsedMetadata)) {
          setMetadataFields(parsedMetadata);
        } else {
          const fields = Object.entries(parsedMetadata || {})
            .map(([key, value], index) => ({
              key,
              value: String(value),
              id: `field_${index}`
            }));
          setMetadataFields(fields.length > 0 ? fields : [{key: '', value: '', id: 'field_0'}]);
        }
      } catch (error) {
        console.error('Error parsing metadata:', error);
        setMetadataFields([{key: '', value: '', id: 'field_0'}]);
      }
    } else {
      setMetadataFields([{key: '', value: '', id: 'field_0'}]);
    }
  }, [variation]);

  const addField = () => {
    const newId = `field_${Date.now()}`;
    setMetadataFields([...metadataFields, {key: '', value: '', id: newId}]);
  };

  const removeField = (id: string) => {
    if (metadataFields.length > 1) {
      setMetadataFields(metadataFields.filter(field => field.id !== id));
    }
  };

  const updateField = (i: any, id: string, type: 'key' | 'value' | 'code', newValue: string) => {
    setMetadataFields(metadataFields.map((field, index) =>
      index === i ? {...field, [type]: newValue} : field
    ));
  };

  const buildMetadataObject = () => {
    const metadata: any[] = [];
    metadataFields.forEach(field => {
      if (field.key.trim() && field.value.trim()) {
        metadata.push(field);
        //metadata[field.key.trim()] = field.value.trim();
      }
    });
    return metadata;
  };

  const submit = (values: any) => {
    setLoading(true);
    const data = {
      ...values,
      product_uuid: values.product_uuid ? values.product_uuid : product?.uuid,
    }

    axios
      .request({
        url: variation ? `warehouses/variations/${variation.uuid}` : "warehouses/variations",
        method: variation ? 'PUT' : 'POST',
        data
      })
      .then(() => {
        setLoading(false);
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
    <Form form={form} layout="vertical" initialValues={variation} onFinish={submit}>
      <h2>{variation ? 'Editar variación de' : 'Registrar variación de'} {product?.name}</h2>
      <Row gutter={20}>
        <Col xs={12}>
          <Divider>Información general</Divider>
          <Form.Item label="Producto" name={'product_uuid'} initialValue={product?.uuid}>
            <ProductSelector/>
          </Form.Item>
          <Row gutter={15}>
            <Col md={15} xs={13}>
              <Form.Item label="Nombre de la variación (opcional)" name={'variation_name'}>
                <Input placeholder={product?.name}/>
              </Form.Item>
            </Col>
            <Col md={9}>
              <Form.Item label="Estado" name={'is_public'}>
                <Select
                  placeholder={'Público'}
                  popupMatchSelectWidth={false}
                  style={{width: '100%'}}
                  options={[
                    {label: 'Público (disponible para venta)', value: '1'},
                    {label: 'Privado (interno)', value: '0'},
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
            <Col md={4} xs={12}>
              <Form.Item label="Orden" name={'order'}>
                <InputNumber placeholder={'1'}/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Descripción interna (opcional)" name={'description'}>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item label="Descripción publica corta (opcional)" name={'excerpt'}>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item label="Descripción pública (opcional)" name={'commercial_description'}>
            <DefaultEditor style={{height: 130}}/>
          </Form.Item>
        </Col>
        <Col xs={12}>
          <Divider>Imagenes</Divider>
          <Form.Item name={'file_cover_uuid'} label={'Portada'}>
            <FileUploader showPreview
                          imagePath={variation?.attachments?.length ? variation.attachments[0].thumbnail : undefined}/>
          </Form.Item>
          <Form.Item label={'Galería'}>
            {variation?.attachments?.map((attachment: any) => (
              <Image src={attachment.thumbnail} width={50}/>
            ))}
          </Form.Item>
          <Form.Item name={'gallery'}>
            <FileUploader multiple targetContainerUuid={variation?.container_uuid}/>
          </Form.Item>
          <Divider>Avanzado</Divider>
          <Form.Item name={'has_commissions'}>
            <Checkbox>
              Habilitar comisiones <br/>
              <small>Los porcentajes de las comisiones se ajustan según la categoría del venedor</small>
            </Checkbox>
          </Form.Item>
          <Form.Item label="Metadata (Información adicional del stock)">
            <div style={{marginBottom: '16px'}}>
              {metadataFields?.map((field, index) => (
                <Row key={index} gutter={8} style={{marginBottom: '8px'}}>
                  <Col span={4}>
                    <Input
                      placeholder="Código"
                      value={field.code}
                      onChange={(e) => updateField(index, field.id, 'code', e.target.value)}
                    />
                  </Col>
                  <Col span={8}>
                    <Input
                      placeholder="Campo (ej: Ubicacion)"
                      value={field.key}
                      onChange={(e) => updateField(index, field.id, 'key', e.target.value)}
                    />
                  </Col>
                  <Col span={10}>
                    <Input
                      placeholder="Valor (ej: A1-B2)"
                      value={field.value}
                      onChange={(e) => updateField(index, field.id, 'value', e.target.value)}
                    />
                  </Col>
                  <Col span={2}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined/>}
                      onClick={() => removeField(field.id)}
                      disabled={metadataFields.length === 1}
                      style={{height: '32px'}}
                    />
                  </Col>
                </Row>
              ))}
              <Button
                type="dashed"
                onClick={addField}
                icon={<PlusOutlined/>}
                style={{width: '100%', marginTop: '8px'}}
              >
                Agregar campo
              </Button>
            </div>

            <small style={{color: '#a6a6a6', display: 'block', lineHeight: '1.4'}}>
              <strong>Agrega información adicional específica de este stock.</strong>
              <br/>
              Campos sugeridos: ubicación, lote, proveedor ref, test realizado, condition, vencimiento proximo.
            </small>
          </Form.Item>
        </Col>
      </Row>

      <PrimaryButton loading={loading} block htmlType={'submit'} label={'Guardar'}/>
      {variation &&
        <ActivityLogViewer id={variation?.uuid} entity={'storage_product_variation'}/>
      }
    </Form>
  );
};

export default ProductVariationForm;
