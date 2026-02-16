import React, {useContext, useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Divider, Select, Button, message} from "antd";
import {useForm} from "antd/lib/form/Form";
import {NavLink} from "react-router-dom";
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
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";
import EntityGalleryEditor from "../../../FileManagement/Components/EntityGalleryEditor";
import ProductVariationSelector from "../ProductVariationSelector";
import HtmlEditor from "../../../CommonUI/HtmlEditor";
import TaxonomySelector from "../../../TaxonomyManagement/Components/TaxonomySelector";
import StockStatus from "../ProductStockManager/StockStatus.tsx";
import Config from "../../../Config";
import AuthContext from "../../../Context/AuthContext.tsx";

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
  const {config} = useContext(AuthContext);

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

  const copyText = (text?: string) => {
    if (text) {
      const cleanText = stripHtmlPreserveNewlines(text);
      navigator.clipboard.writeText(cleanText).then(() => {
        message.success('Copiado al portapapeles').then();
      });
    }
  };

  const stripHtmlPreserveNewlines = (html: string) => {
    let text = html.replace(/<br\s*\/?>/gi, '\n');

    const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'section', 'article', 'header', 'footer'];
    blockTags.forEach(tag => {
      text = text.replace(new RegExp(`</${tag}>`, 'gi'), '\n');
    });

    text = text.replace(/<[^>]+>/g, '');

    text = text.replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');

    return text.trim();
  }

  const formType = config?.id == 'candares' ? 'estate' : 'regular';

  return (
    <>
      <h2>{stock ? 'Editar stock' : 'Registrar stock'} {stock && <StockStatus status={stock.status}/>}</h2>
      <Form form={form} layout="vertical" initialValues={{
        ...stock,
        expiration_date: stock?.expiration_date ? dayjs(stock.expiration_date) : null,
      }} onFinish={submit}>
        <Row gutter={[20, 20]}>
          <Col md={13}>
            {!variation && !stock && (
              <Form.Item
                label="Tipo de propiedad" name={'variation_uuid'}
                rules={[{required: true}]}>
                <ProductVariationSelector/>
              </Form.Item>
            )}
            <Row gutter={15}>
              <Col md={8}>
                <Form.Item
                  label="Ubicación" initialValue={stock?.fk_warehouse_uuid} name={'warehouse_uuid'}
                  rules={[{required: true}]}>
                  <WarehouseSelector/>
                </Form.Item>
              </Col>
              <Col md={16}>
                <Form.Item label="Asesor encargado" name={'provider_uuid'} rules={[{required: true}]}>
                  <CompanySelector style={{maxWidth: 190}} filter={'providers'}
                                   placeholder={stock?.provider?.company?.name}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col md={9}>
                <Form.Item label="Código de propiedad" name={'serial_number'}>
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
                <Form.Item label={'Tipo de operación'} name={'type'}>
                  <TaxonomySelector
                    placeholder={'Tipo'}
                    onChange={(val) => {
                      setSelectedType(val);
                    }} code={'stock-types'} property={'code'}/>
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
              {/*
              <Col md={9}>
                <Form.Item label="Costo" name={'cost_price'}>
                  <MoneyInput currency={currentCurrency || stock?.currency}/>
                </Form.Item>
              </Col>
              */}
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
                  <InputNumber prefix={'Cantidad'} style={{width: '100%'}}
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
            <Form.Item
              name={'attachments'}
              label={<>
                Galería de imagenes {' - '}
                <NavLink target={'_blank'} to={`/file-management/${stock?.attachments_container_uuid}`}>
                  <Button size={'small'} type={'primary'} ghost>Ver carpeta</Button>
                </NavLink>
              </>}
            >
              <EntityGalleryEditor/>
            </Form.Item>
            <Form.Item name={'excerpt'} label={'Resumen'}>
              <HtmlEditor height={140}/>
            </Form.Item>
            <Form.Item
              name={'commercial_description'}
              label={<>Información adicional {' - '}<Button type={'primary'} ghost size={'small'}
                                                            onClick={() => copyText(stock?.commercial_description)}>Copiar
                texto</Button></>}>
              <HtmlEditor height={230}/>
            </Form.Item>
            <Divider titlePlacement={'left'}>Información adicional</Divider>
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
