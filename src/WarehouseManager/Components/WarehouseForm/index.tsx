import React, {useEffect} from 'react';
import {Checkbox, Form, Input, Select} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";

import type {StorageWarehouse} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";
import WarehouseSelector from "../WarehouseSelector";
import LocationsSelector from "../../../MoveManagement/Components/LocationsSelector";
import ProductGroupsSelector from "../ProductGroupsSelector";
import GoogleMapsBoundsPicker from "../../../CommonUI/GoogleMapsBoundsPicker";
import ApiFileSelector from "../../../FileManagement/Components/ApiFileSelector";

interface WarehouseFormProps {
  warehouse?: StorageWarehouse;
  onComplete?: () => void;
}

export const WarehouseForm = ({warehouse, onComplete}: WarehouseFormProps) => {
  const [form] = useForm();
  const distributionFileUrl = warehouse?.distribution_file?.source
    || warehouse?.distribution_file?.download
    || warehouse?.distribution_file?.thumbnail;

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [warehouse, form]);

  const submit = (values: any) => {
    const data = {
      ...values,
      distribution_top_left_bound: values.distribution_bounds?.topLeft,
      distribution_bottom_right_bound: values.distribution_bounds?.bottomRight,
    };

    delete data.distribution_bounds;

    axios
      .request({
        url: warehouse ? `warehouses/${warehouse.uuid}` : "warehouses",
        method: warehouse ? 'PUT' : 'POST',
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
      ...warehouse,
      distribution_bounds: {
        topLeft: warehouse?.distribution_top_left_bound,
        bottomRight: warehouse?.distribution_bottom_right_bound,
      }
    }} onFinish={submit}>
      <h2>{warehouse ? 'Editar almacén' : 'Crear almacén'}</h2>
      <Form.Item label="Nombre" name={'name'}>
        <Input/>
      </Form.Item>
      <Form.Item label="Tipo (opcional)" name={'type'}>
        <Input placeholder='Eje: Almacén, Archivero, Cajón, Estante, etc' />
      </Form.Item>
      <Form.Item label="Alcamen padre (opcional)" name={'fk_warehouse_uuid'}>
        <WarehouseSelector />
      </Form.Item>
      <Form.Item label="Ubicación (opcional)" name={'fk_location_uuid'}>
        <LocationsSelector />
      </Form.Item>
      <Form.Item label="Dirección (opcional)" name={'address'}>
        <Input/>
      </Form.Item>
      <Form.Item label="Descripción (opcional)" name={'description'}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="¿Tene ubicación física?" name={'is_physical'} valuePropName={'checked'}>
        <Checkbox defaultChecked>
          Tiene ubicación física
        </Checkbox>
      </Form.Item>
      <Form.Item label={'Croquis para superposición'} name={'distribution_file_uuid'}>
        <ApiFileSelector/>
      </Form.Item>
      <Form.Item label="Límites de distribución" name={'distribution_bounds'}>
        <GoogleMapsBoundsPicker overlayImageUrl={distributionFileUrl} />
      </Form.Item>
      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};
