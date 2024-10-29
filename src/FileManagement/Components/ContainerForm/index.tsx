import React, {useState} from 'react';
import {Button, Form, Input, Radio} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Container} from '../../../Types/api';

interface CreateContainerProps {
  containerUuid?: string;
  container?: Container;
  onCompleted?: (container: any) => void;
}

const CreateContainer = ({container, containerUuid, onCompleted}: CreateContainerProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .request({
        url: container ? `file-management/containers/${container.uuid}` : 'file-management/containers',
        method: container ? 'put' : 'post',
        data: {
          ...values,
          container_uuid: containerUuid,
        },
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
        <Form.Item
          name={'name'}
          label={'Nombre'}
          tooltip={'Puedes usar caracteres especiales, tildes, etc. Esto no afectar a la accesibilidad del archivo'}>
          <Input placeholder={'Nombre'} />
        </Form.Item>
        <Form.Item
          name={'visibility'}
          label={'Visibilidad'}
          help={
            <div style={{lineHeight: '16px', fontSize: 13, marginBottom: 10}}>
              Se aplicará a todos los archivos dentro de este contenedor
            </div>
          }>
          <Radio.Group>
            <Radio value={'private'}>Privado</Radio>
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
