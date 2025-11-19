import React, {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Divider, Select} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";
import dayjs from "dayjs";

import type {StorageProductVariation, StorageStock} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import WarehouseSelector from "../WarehouseSelector";
import MoneyInput from "../../../CommonUI/MoneyInput";
import CurrencySelector from "../../../PaymentManagement/Components/CurrencySelector";
import CompanySelector from "../../../HRManagement/Components/CompanySelector";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";
import Config from "../../../Config.tsx";
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";
import EntityGalleryEditor from "../../../FileManagement/Components/EntityGalleryEditor";
import ProductVariationSelector from "../ProductVariationSelector";
import HtmlEditor from "../../../CommonUI/HtmlEditor";
import TaxonomySelector from "../../../TaxonomyManagement/Components/TaxonomySelector";

interface ProductStockFormProps {
  stock?: StorageStock;
  variation?: StorageProductVariation;
  onComplete?: () => void;
}

const ProductStockForm = ({variation, stock, onComplete}: ProductStockFormProps) => {
  const [form] = useForm();
  const [currentCurrency, setCurrentCurrency] = useState<string>();
  const [isConsumable, setIsConsumable] = useState<boolean | undefined>(stock?.is_consumable);
  const [metadata, setMetadata] = useState<any[]>();
  const [selectedType, setSelectedType] = useState<string | undefined>(stock?.type);

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [stock, form]);

  const submit = (values: any) => {
    const data = {
      ...values,
      variation_uuid: variation ? variation.uuid : values.variation_uuid,
      cost_price: values.cost_price,
      sale_price: values.sale_price,
      metadata: metadata,
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
    <>
      <h2>{stock ? 'Editar stock' : 'Registrar stock'}</h2>
      {stock?.status}
      <Form form={form} layout="vertical" initialValues={{
        ...stock,
        expiration_date: stock?.expiration_date ? dayjs(stock.expiration_date) : null,
      }} onFinish={submit}>
        <Row gutter={[20, 20]}>
          <Col md={13}>
            {!variation && !stock && (
              <Form.Item
                label="Variación" name={'variation_uuid'}
                rules={[{required: true}]}>
                <ProductVariationSelector/>
              </Form.Item>
            )}
            <Row gutter={15}>
              <Col md={8}>
                <Form.Item
                  label="Almacen" initialValue={stock?.fk_warehouse_uuid} name={'warehouse_uuid'}
                  rules={[{required: true}]}>
                  <WarehouseSelector/>
                </Form.Item>
              </Col>
              <Col md={16}>
                <Form.Item label="Proveedor" name={'provider_uuid'} rules={[{required: true}]}>
                  <CompanySelector style={{maxWidth: 190}} filter={'providers'}
                                   placeholder={stock?.provider?.company?.name}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col md={9}>
                <Form.Item label="Número de serie" name={'serial_number'}>
                  <Input style={{fontFamily: 'monospace'}}/>
                </Form.Item>
              </Col>
              <Col md={15}>
                <Form.Item label="Nombre (opcional)" name={'name'}>
                  <Input placeholder={variation?.name || variation?.product?.name}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col md={8}>
                <Form.Item label={'Tipo'} name={'type'}>
                  <TaxonomySelector onChange={val => {
                    setSelectedType(val);
                  }} code={'stock-types'} property={'code'} />
                </Form.Item>
              </Col>
              {(selectedType == 'lease' || selectedType == 'license') ?
                <Col md={8}>
                  <Form.Item label={'Duración'} name={'duration'}>
                    <Select
                      placeholder={'1 mes'}
                      options={[
                        {label: '1 mes', value: '1m'},
                        {label: '6 meses', value: '6m'},
                        {label: '1 año', value: '1y'},
                        {label: '2 años', value: '2y'},
                      ]}/>
                  </Form.Item>
                </Col> :
                <Col md={8}>
                  <Form.Item label="F. de vencimiento" name={'expiration_date'}>
                    <DatePicker placeholder={'No caduca'} style={{width: '100%'}} format={Config.dateFormatUser}/>
                  </Form.Item>
                </Col>
              }
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
                <Form.Item
                  label="Venta"
                  name={'sale_price'}
                  tooltip={'Stock sin precio no podrá ser vendido, para vender gratis poner 0'}>
                  <MoneyInput currency={currentCurrency || stock?.currency}/>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Observaciones (opcional)" name={'observations'}>
              <Input.TextArea/>
            </Form.Item>
            <Row gutter={15}>
              <Col md={15}>
                <Form.Item
                  name={'is_consumable'}
                  valuePropName={'checked'}>
                  <Checkbox onChange={(value) => setIsConsumable(value.target.checked)}>
                    Limitar stock
                    <small>Controlar la cantidad de productos disponibles</small>
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col md={9}>
                <Form.Item name={'quantity'}>
                  <InputNumber addonBefore={'Cantidad'} style={{width: '100%'}}
                               placeholder={isConsumable ? '1' : 'Sin límite'}/>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Orden" name={'order'}>
              <InputNumber/>
            </Form.Item>
            {stock &&
              <Form.Item name={'update_sales'} valuePropName={'checked'}>
                <Checkbox>Actualizar ventas con precio fijo</Checkbox>
              </Form.Item>
            }
          </Col>
          <Col md={11}>
            <Form.Item name={'attachments'} label={'Galería de imagenes'}>
              <EntityGalleryEditor/>
            </Form.Item>
            <Form.Item name={'excerpt'} label={'Resumen'}>
              <Input.TextArea/>
            </Form.Item>
            <Form.Item name={'commercial_description'} label={'Información adicional'}>
              <HtmlEditor height={120}/>
            </Form.Item>
            <Divider orientation={'left'}>Información adicional</Divider>
            <Form.Item name={'attributes'}>
              <EntityFieldsEditor
                entity={stock}
                onChange={(values) => {
                  setMetadata(values);
                }}/>
            </Form.Item>
          </Col>
        </Row>
        <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
        {stock &&
          <ActivityLogViewer id={stock?.uuid} entity={'storage_stock'}/>
        }
      </Form>
    </>
  );
};

export default ProductStockForm;
