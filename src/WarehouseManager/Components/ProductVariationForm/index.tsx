import React, {useEffect, useState} from 'react';
import {Col, Form, Input, InputNumber, Row, Select, Divider} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";

import type {StorageProduct, StorageProductVariation} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import ProductSelector from "../ProductSelector";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";
import HtmlEditor from "../../../CommonUI/HtmlEditor";
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";
import EntityGalleryEditor from "../../../FileManagement/Components/EntityGalleryEditor";

interface ProductVariationFormProps {
  variation?: StorageProductVariation;
  product?: StorageProduct;
  onComplete?: () => void;
}

const ProductVariationForm = ({product, variation, onComplete}: ProductVariationFormProps) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [variation, form]);

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
              <Form.Item label="SKU" name={'sku'} tooltip={'Si se deja vacío, el sistema generar uno'}>
                <Input placeholder={'Autogenerar'}/>
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
            <HtmlEditor/>
          </Form.Item>
        </Col>
        <Col xs={12}>
          <Divider>Imagenes</Divider>
          <Form.Item label={'Galería'} name={'attachments'}>
            <EntityGalleryEditor />
          </Form.Item>
          <Divider>Avanzado</Divider>
          <Form.Item label="Atributos adicionales" name={'attributes'}>
            <EntityFieldsEditor entity={variation} showHint/>
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
