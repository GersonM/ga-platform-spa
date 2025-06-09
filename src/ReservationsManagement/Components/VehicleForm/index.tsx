import {useState} from 'react';
import {Col, Form, Input, InputNumber, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import type {MoveRoute, MoveVehicle} from '../../../Types/api';
import DriverSelector from '../../../CommonUI/DriverSelector';

interface VehicleFormProps {
  onCompleted: () => void;
  vehicle?: MoveVehicle;
}

const VehicleForm = ({onCompleted, vehicle}: VehicleFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: MoveRoute) => {
    setLoading(true);
    axios
      .request({
        url: vehicle ? `move/vehicles/${vehicle.uuid}` : 'move/vehicles',
        method: vehicle ? 'put' : 'post',
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
      <Form form={form} initialValues={vehicle} layout={'vertical'} onFinish={submitForm} requiredMark={false}>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item
              name={'registration_plate'}
              label={'Placa de rodaje'}
              rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={'circulation_card'}
              label={'Tarjeta de circulación'}
              rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={'type'} label={'Tipo'} rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={'max_capacity'}
              label={'Capacidad máxima'}
              rules={[{required: true, message: 'Requerido'}]}>
              <InputNumber suffix={'Pax'} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col span={8}>
            <Form.Item name={'brand'} label={'Fabricante'} rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'model'} label={'Modelo'} rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={'color'} label={'Color'} rules={[{required: true, message: 'Requerido'}]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'fk_driver_uuid'} label={'Conductor'}>
          <DriverSelector />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default VehicleForm;
