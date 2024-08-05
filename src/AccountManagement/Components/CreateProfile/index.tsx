import React, {useState} from 'react';
import {Button, Col, Form, Input, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Profile} from '../../../Types/api';

interface CreateUserProps {
  onCompleted?: (profile: Profile) => void;
}

const CreateProfile = ({onCompleted}: CreateUserProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .post(`hr-management/profiles`, {
        ...values,
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
    <Form form={form} onFinish={submitForm} layout={'vertical'}>
      <Form.Item name={'name'} label={'Nombre'}>
        <Input placeholder={'Nombre'} />
      </Form.Item>
      <Form.Item name={'last_name'} label={'Apellidos'}>
        <Input />
      </Form.Item>
      <Form.Item name={'email'} label={'E-mail'}>
        <Input placeholder={'E-mail'} />
      </Form.Item>
      <Form.Item name={'phone'} label={'Teléfono'}>
        <Input />
      </Form.Item>
      <Row gutter={15}>
        <Col md={10}>
          <Form.Item name={'doc_type'} label={'Tipo de documento'}>
            <Select
              placeholder={'Elige'}
              options={[
                {label: 'DNI', value: 'dni'},
                {label: 'CE', value: 'ce'},
                {label: 'Pasaporte', value: 'passport'},
              ]}
            />
          </Form.Item>
        </Col>
        <Col md={14}>
          <Form.Item name={'doc_number'} label={'N° Documento'}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={15}>
        <Col md={12}>
          <Form.Item name={'company'} label={'Empresa'}>
            <Input />
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item name={'company_group'} label={'Área de la empresa'}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Button block shape={'round'} loading={loading} type={'primary'} htmlType={'submit'}>
        Registrar perfil
      </Button>
    </Form>
  );
};

export default CreateProfile;
