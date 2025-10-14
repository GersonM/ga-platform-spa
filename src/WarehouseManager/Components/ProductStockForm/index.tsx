import React, {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Button, Divider} from "antd";
import {useForm} from "antd/lib/form/Form";
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import axios from "axios";
import dayjs from "dayjs";

import type {MetadataField, StorageProductVariation, StorageStock} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import WarehouseSelector from "../WarehouseSelector";
import MoneyInput from "../../../CommonUI/MoneyInput";
import CurrencySelector from "../../../PaymentManagement/Components/CurrencySelector";
import CompanySelector from "../../../HRManagement/Components/CompanySelector";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";
import Config from "../../../Config.tsx";
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";

interface ProductStockFormProps {
  stock?: StorageStock;
  variation?: StorageProductVariation;
  onComplete?: () => void;
}

const ProductStockForm = ({variation, stock, onComplete}: ProductStockFormProps) => {
  const [form] = useForm();
  const [currentCurrency, setCurrentCurrency] = useState<string>();
  const [isConsumable, setIsConsumable] = useState<boolean | undefined>(stock?.is_consumable);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [metadata, setMetadata] = useState<any[]>();

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [stock, form]);

  useEffect(() => {
    if (stock?.metadata) {
      try {
        const parsedMetadata = typeof stock.metadata === 'string'
          ? JSON.parse(stock.metadata)
          : stock.metadata;
        console.log({parsedMetadata});
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
  }, [stock]);

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
    //const metadata = buildMetadataObject();

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
      <Row gutter={[20, 20]}>
        <Col md={13}>
          <Form form={form} layout="vertical" initialValues={{
            ...stock,
            expiration_date: stock?.expiration_date ? dayjs(stock.expiration_date) : null,
          }} onFinish={submit}>
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
                  <CompanySelector style={{maxWidth:190}} filter={'providers'} placeholder={stock?.provider?.company?.name}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={15}>
              <Col md={9}>
                <Form.Item label="Número de serie" name={'serial_number'}>
                  <Input/>
                </Form.Item>
              </Col>
              <Col md={15}>
                <Form.Item label="Fecha de vencimiento (opcional)" name={'expiration_date'}>
                  <DatePicker placeholder={'No caduca'} style={{width: '100%'}} format={Config.dateFormatUser}/>
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
                <Form.Item
                  label="Venta"
                  name={'sale_price'}
                  tooltip={'Stock sin precio no podrá ser vendido, para vender gratis poner 0'}>
                  <MoneyInput currency={currentCurrency || stock?.currency}/>
                </Form.Item>
                {stock &&
                  <Form.Item name={'update_sales'} valuePropName={'checked'}>
                    <Checkbox>Actualizar ventas con precio fijo</Checkbox>
                  </Form.Item>
                }
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
            <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
            {stock &&
              <ActivityLogViewer id={stock?.uuid} entity={'storage_stock'}/>
            }
          </Form>
        </Col>
        <Col md={11}>
          <Divider orientation={'left'}>Información adicional</Divider>
          <div style={{marginBottom: '16px'}}>
            {stock?.attributes &&
              <EntityFieldsEditor
                fieldValues={stock?.attributes} entity={stock}
                onChange={(values) => {
                  console.log(values);
                  setMetadata(values);
                }}/>
            }
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ProductStockForm;
