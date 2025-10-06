import React, {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select, Button, Divider} from "antd";
import {useForm} from "antd/lib/form/Form";
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import axios from "axios";
import dayjs from "dayjs";

import type {MetadataField, StorageProductVariation, StorageStock} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import ProductSelector from "../ProductSelector";
import WarehouseSelector from "../WarehouseSelector";
import MoneyInput from "../../../CommonUI/MoneyInput";
import CurrencySelector from "../../../PaymentManagement/Components/CurrencySelector";
import CompanySelector from "../../../HRManagement/Components/CompanySelector";
import ActivityLogViewer from "../../../ActivityLog/Components/ActivityLogViewer";
import Config from "../../../Config.tsx";

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
    const metadata = buildMetadataObject();

    const data = {
      ...values,
      variation_uuid: variation ? variation.uuid : values.variation_uuid,
      cost_price: values.cost_price,
      sale_price: values.sale_price,
      metadata: JSON.stringify(metadata),
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
    <Form form={form} layout="vertical" initialValues={{
      ...stock,
      expiration_date: stock?.expiration_date ? dayjs(stock.expiration_date) : null,
    }} onFinish={submit}>
      <h2>{stock ? 'Editar stock' : 'Registrar stock'}</h2>
      <Row gutter={15}>
        <Col md={8} xs={12}>
          <Form.Item
            label="Almacen" initialValue={stock?.fk_warehouse_uuid} name={'warehouse_uuid'}
            rules={[{required: true}]}>
            <WarehouseSelector/>
          </Form.Item>
        </Col>
        <Col md={16} xs={12}>
          <Form.Item label="Proveedor" name={'provider_uuid'} rules={!stock ? [{required: true}] : undefined}>
            <CompanySelector filter={'providers'} placeholder={stock?.provider?.company?.name}/>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={15}>
        <Col md={9} xs={12}>
          <Form.Item label="Número de serie" name={'serial_number'}>
            <Input/>
          </Form.Item>
        </Col>
        <Col md={15} xs={12}>
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
          <Button size={'small'} disabled block>Registrar números de serie</Button>
        </Col>
        <Col md={9}>
          {isConsumable &&
            <Form.Item label="Cantidad" name={'quantity'}>
              <InputNumber style={{width: '100%'}} defaultValue={1}/>
            </Form.Item>
          }
        </Col>
      </Row>
      <Form.Item label="Orden" name={'order'}>
        <InputNumber/>
      </Form.Item>
      <Divider>Avanzado</Divider>
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

      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
      {stock &&
        <ActivityLogViewer id={stock?.uuid} entity={'storage_stock'}/>
      }
    </Form>
  );
};

export default ProductStockForm;
