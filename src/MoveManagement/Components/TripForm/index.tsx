import React, {useState} from 'react';
import {Form, Input, InputNumber, TimePicker} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveLocation} from '../../../Types/api';
import RouteSelector from '../RouteSelector';
import VehicleSelector from '../VehicleSelector';
import {CheckIcon} from '@heroicons/react/24/solid';

interface TripFormProps {
  onCompleted: () => void;
  route?: MoveLocation;
}

const TripForm = ({onCompleted, route}: TripFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: Location) => {
    setLoading(true);
    axios
      .request({
        url: route ? `move/trips/${route.uuid}` : 'move/trips',
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
        <Form.Item name={'fk_route_uuid'} label={'Ruta'}>
          <RouteSelector />
        </Form.Item>
        <Form.Item name={'fk_vehicule_uuid'} label={'Vehículo'}>
          <VehicleSelector />
        </Form.Item>
        <Form.Item
          name={'departure_time'}
          label={'Hora de salida'}
          rules={[{required: true, message: 'La dirección es requerida'}]}>
          <TimePicker use12Hours needConfirm={false} showNow={false} minuteStep={15} format="HH:mm" />
        </Form.Item>
        <Form.Item name={'arrival_time'} label={'Hora de llegada'}>
          <TimePicker use12Hours needConfirm={false} showNow={false} minuteStep={15} format="HH:mm" />
        </Form.Item>
        <Form.Item name={'max_passengers'} label={'Pasajeros máximo'}>
          <InputNumber />
        </Form.Item>
        <PrimaryButton block icon={<CheckIcon />} loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default TripForm;
