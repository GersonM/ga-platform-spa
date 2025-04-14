import React, {useState} from 'react';
import {Form, Input, Radio} from 'antd';
import {BiCheck} from 'react-icons/bi';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Container} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface ContainerFormProps {
  containerUuid?: string;
  container?: Container;
  onCompleted?: (container: any) => void;
}

const ContainerForm = ({container, containerUuid, onCompleted}: ContainerFormProps) => {
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
    <div style={{width: 200, padding: 5}}>
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
          extra={'Se aplicará a todos los archivos dentro de este contenedor'}>
          <Radio.Group>
            <Radio value={'private'}>Privado</Radio>
            <Radio value={'public'}>Público</Radio>
          </Radio.Group>
        </Form.Item>
        <PrimaryButton block icon={<BiCheck />} loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </div>
  );
};

export default ContainerForm;
