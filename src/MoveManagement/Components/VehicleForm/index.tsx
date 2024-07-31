import React, {useState} from 'react';
import {Col, Form, Input, InputNumber, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveRoute, MoveVehicle} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';

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
      <Form
        name="outerForm"
        form={form}
        initialValues={vehicle}
        layout={'vertical'}
        onFinish={submitForm}
        requiredMark={false}>
        <Form.Item
          name={'registration_plate'}
          label={'Placa de rodaje'}
          rules={[{required: true, message: 'Requerido'}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'color'} label={'Color'} rules={[{required: true, message: 'Requerido'}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'max_capacity'} label={'Capacidad máxima'} rules={[{required: true, message: 'Requerido'}]}>
          <InputNumber suffix={'Pax'} />
        </Form.Item>
        <Form.Item name={'brand'} label={'Fabricante'} rules={[{required: true, message: 'Requerido'}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'model'} label={'Modelo'} rules={[{required: true, message: 'Requerido'}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'fk_driver_uuid'} label={'Conductor'} rules={[{required: true, message: 'Requerido'}]}>
          <ProfileSelector />
        </Form.Item>
        <Form.Item name={'type'} label={'Tipo'} rules={[{required: true, message: 'Requerido'}]}>
          <Input />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default VehicleForm;
