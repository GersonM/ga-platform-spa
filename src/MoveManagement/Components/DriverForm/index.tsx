import React, {useState} from 'react';
import {Col, Form, Input, InputNumber, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveDriver, MoveRoute} from '../../../Types/api';

interface CountryFormProps {
  onCompleted: () => void;
  driver?: MoveDriver;
}

const RouteForm = ({onCompleted, driver}: CountryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: MoveRoute) => {
    setLoading(true);
    axios
      .request({
        url: driver ? `move/drivers/${driver.uuid}` : 'move/drivers',
        method: driver ? 'put' : 'post',
        data: values,
      })
      .then(() => {
        setLoading(false);
        if (onCompleted) {
          onCompleted();
          form.resetFields();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <Form form={form} initialValues={driver} layout={'vertical'} onFinish={submitForm}>
        <Form.Item name={'name'} label={'Name'} rules={[{required: true, message: 'El nombre es requerido'}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'last_name'} label={'Apellidos'} rules={[{required: true}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'email'} label={'E-mail'}>
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
        <Form.Item name={'phone'} label={'Teléfono'}>
          <Input />
        </Form.Item>
        <Form.Item name={'license_type'} label={'Tipo de licencia'}>
          <Input />
        </Form.Item>
        <Form.Item name={'license_number'} label={'Número de licencia'}>
          <Input />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default RouteForm;
