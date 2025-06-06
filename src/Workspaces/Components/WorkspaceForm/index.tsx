import React from 'react';
import {Form, Input} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

const WorkspaceForm = () => {
  const submit = (values: any) => {
    axios
      .post('workspaces', values)
      .then(res => {})
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };
  return (
    <div>
      <Form layout="vertical" onFinish={submit}>
        <Form.Item label={'ID'} name={'id'}>
          <Input />
        </Form.Item>
        <Form.Item label={'Nombre'} name={'name'}>
          <Input />
        </Form.Item>
        <Form.Item label={'Dominio'} name={'domain'}>
          <Input />
        </Form.Item>
        <PrimaryButton htmlType={'submit'} label={'Crear'} block />
      </Form>
    </div>
  );
};

export default WorkspaceForm;
