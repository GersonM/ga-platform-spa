import React, {useState} from 'react';
import {Button, Form, Input} from 'antd';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {useForm} from 'antd/lib/form/Form';

interface CreateContainerProps {
  containerUuid?: string;
  onCompleted?: (container: any) => void;
}

const CreateContainer = ({
  containerUuid,
  onCompleted,
}: CreateContainerProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .post(`file-management/containers`, {
        ...values,
        container_uuid: containerUuid,
      })
      .then(response => {
        setLoading(false);
        form.resetFields();
        if (onCompleted) {
          onCompleted(response.data);
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      <h4>Nuevo {containerUuid ? 'folder' : 'contenedor'}</h4>
      <Form form={form} onFinish={submitForm} layout={'inline'}>
        <Form.Item name={'name'}>
          <Input placeholder={'Nombre'} />
        </Form.Item>
        <Button
          shape={'round'}
          icon={<span className="button-icon icon-plus"></span>}
          loading={loading}
          type={'primary'}
          htmlType={'submit'}>
          Crear
        </Button>
      </Form>
    </div>
  );
};

export default CreateContainer;
