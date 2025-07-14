import {useState} from 'react';
import {Button, Col, Divider, Form, Input, Row, Select} from 'antd';
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
    <div>
      <h2>Registrar persona</h2>
      <Form form={form} onFinish={submitForm} layout={'vertical'} initialValues={{visibility: 'public'}}>
        <Form.Item name={'name'} label={'Nombre'} rules={[{required: true}]}>
          <Input placeholder={'Nombre'}/>
        </Form.Item>
        <Form.Item name={'last_name'} label={'Apellidos'} rules={[{required: true}]}>
          <Input placeholder={'Apellidos'}/>
        </Form.Item>
        <Row gutter={15}>
          <Col span={8}>
            <Form.Item name={'doc_type'} label={'Tipo de documento'}>
              <Select
                placeholder={'DNI'}
                options={[
                  {label: 'DNI', value: 'dni'},
                  {label: 'CE', value: 'ce'},
                  {label: 'Pasaporte', value: 'passport'},
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name={'doc_number'} label={'Número de documento'}>
              <Input placeholder={'Número'}/>
            </Form.Item>
          </Col>
        </Row>
        <Divider>Crear cuenta</Divider>
        <p>Estos datos on opcionales, si especificas una contraseña esta persona podrá iniciar sesión en el sistema</p>
        <Form.Item name={'email'} label={'E-mail'}>
          <Input placeholder={'E-mail'}/>
        </Form.Item>
        <Form.Item name={'password'} label={'Contraseña'}>
          <Input.Password placeholder={'Contraseña'}/>
        </Form.Item>
        <Button block shape={'round'} loading={loading} type={'primary'} htmlType={'submit'}>
          Crear usuario
        </Button>
      </Form>
    </div>
  );
};

export default CreateUser;
