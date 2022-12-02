import React, {useState} from 'react';
import {Button, Form, Input, Radio} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';

interface CreateContainerProps {
  containerUuid?: string;
  onCompleted?: (container: any) => void;
}

const CreateContainer = ({containerUuid, onCompleted}: CreateContainerProps) => {
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
    <div style={{width: 240, padding: 5}}>
      <Form form={form} onFinish={submitForm} layout={'vertical'} initialValues={{visibility: 'public'}}>
        <Form.Item name={'name'} label={'Nombre'}>
          <Input placeholder={'Nombre'} />
        </Form.Item>
        <Form.Item
          name={'visibility'}
          label={'Visibilidad'}
          extra={<small>Se aplicará a todos los archivos dentro de este contenedor</small>}>
          <Radio.Group>
            <Radio disabled value={'private'}>
              Privado
            </Radio>
            <Radio value={'public'}>Público</Radio>
          </Radio.Group>
        </Form.Item>
        <Button
          block
          shape={'round'}
          icon={<span className="button-icon icon-check"></span>}
          loading={loading}
          type={'primary'}
          htmlType={'submit'}>
          Enviar
        </Button>
      </Form>
    </div>
  );
};

export default CreateContainer;
