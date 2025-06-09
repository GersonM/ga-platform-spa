import {useState} from 'react';
import {Col, Form, Input, InputNumber, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import type {MoveRoute} from '../../../Types/api';

interface CountryFormProps {
  onCompleted: () => void;
  route?: MoveRoute;
}

const RouteForm = ({onCompleted, route}: CountryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: MoveRoute) => {
    setLoading(true);
    axios
      .request({
        url: route ? `move/routes/${route.uuid}` : 'move/routes',
        method: route ? 'put' : 'post',
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
      <Form name="outerForm" form={form} initialValues={route} layout={'vertical'} onFinish={submitForm}>
        <Form.Item name={'name'} label={'Name'} rules={[{required: true, message: 'El nombre es requerido'}]}>
          <Input />
        </Form.Item>
        <Row>
          <Col span={8}>
            <Form.Item name={'duration'} label={'Duración'}>
              <InputNumber suffix={'min.'} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'distance'} label={'Distancia'}>
              <InputNumber suffix={'Km.'} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'cost'} label={'Costo'}>
              <InputNumber prefix={'S/'} placeholder={'0'} />
            </Form.Item>
          </Col>
        </Row>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default RouteForm;
