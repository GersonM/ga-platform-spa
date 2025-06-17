import React, {useEffect} from 'react';
import {Checkbox, Form, Input} from "antd";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";

import type {StorageWarehouse} from "../../../Types/api.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler";

interface WarehouseFormProps {
  warehouse?: StorageWarehouse;
  onComplete?: () => void;
}

const WarehouseForm = ({warehouse, onComplete}: WarehouseFormProps) => {
  const [form] = useForm();

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [warehouse, form]);

  const submit = (values: any) => {
    axios
      .request({
        url: warehouse ? `warehouses/${warehouse.uuid}` : "warehouses",
        method: warehouse ? 'PUT' : 'POST',
        data: values
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
    <Form form={form} layout="vertical" initialValues={warehouse} onFinish={submit}>
      <h2>{warehouse ? 'Editar almacén' : 'Crear almacén'}</h2>
      <Form.Item label="Nombre" name={'name'}>
        <Input/>
      </Form.Item>
      <Form.Item label="Dirección (opcional)" name={'address'}>
        <Input/>
      </Form.Item>
      <Form.Item label="¿Tene ubicación física?" name={'is_physical'} valuePropName={'checked'}>
        <Checkbox defaultChecked>
          Tiene ubicación física
        </Checkbox>
      </Form.Item>
      <PrimaryButton block htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default WarehouseForm;
