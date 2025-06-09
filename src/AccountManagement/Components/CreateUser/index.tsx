import {useState} from 'react';
import {Button, Form, Input} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';

interface CreateUserProps {
  containerUuid?: string;
  onCompleted?: (container: any) => void;
}

const CreateUser = ({containerUuid, onCompleted}: CreateUserProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .post(`hr-management/profiles`, {
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
        <Form.Item name={'last_name'} label={'Apellidos'}>
          <Input placeholder={'Nombre'} />
        </Form.Item>
        <Form.Item name={'email'} label={'E-mail'}>
          <Input placeholder={'E-mail'} />
        </Form.Item>
        <Form.Item name={'password'} label={'Contraseña'}>
          <Input.Password placeholder={'Contraseña'} />
        </Form.Item>
        <Button block shape={'round'} loading={loading} type={'primary'} htmlType={'submit'}>
          Crear usuario
        </Button>
      </Form>
    </div>
  );
};

export default CreateUser;
