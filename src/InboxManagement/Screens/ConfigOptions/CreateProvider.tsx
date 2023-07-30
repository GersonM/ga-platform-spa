import React from 'react';
import {Button, Form, Input, Select} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {useForm} from 'antd/lib/form/Form';

interface CreateProviderProps {
  onFinish: () => void;
}

const CreateProvider = ({onFinish}: CreateProviderProps) => {
  const [form] = useForm();

  const onSubmitForm = (values: any) => {
    axios
      .post(`inbox-management/providers`, values)
      .then(response => {
        if (onFinish) {
          onFinish();
        }
        form.resetFields();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };
  return (
    <div>
      <Form form={form} layout={'vertical'} onFinish={onSubmitForm}>
        <Form.Item name={'name'} label={'Nombre'}>
          <Input />
        </Form.Item>
        <Form.Item name={'host'} label={'Host'}>
          <Input />
        </Form.Item>
        <Form.Item name={'username'} label={'App / Usuario'}>
          <Input />
        </Form.Item>
        <Form.Item name={'key'} label={'Key / Password'}>
          <Input />
        </Form.Item>
        <Form.Item name={'api_endpoint'} label={'Endpoint'}>
          <Input />
        </Form.Item>
        <Form.Item name={'type'} label={'Tipo'}>
          <Select placeholder="Tipos de servidor">
            <Select.Option value="cpanel">Cpanel / Webmail</Select.Option>
            <Select.Option value="gmail">Gmail / Workspace</Select.Option>
            <Select.Option value="outlook">Outlook / Office 365</Select.Option>
          </Select>
        </Form.Item>
        <Button type={'primary'} htmlType={'submit'}>
          Registrar proveedor
        </Button>
      </Form>
    </div>
  );
};

export default CreateProvider;
