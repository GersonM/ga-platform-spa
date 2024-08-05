import React, {useState} from 'react';
import {DatePicker, Form} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RouteSelector from '../RouteSelector';
import VehicleSelector from '../VehicleSelector';
import {MoveLocation, MoveRoute, MoveTrip, MoveVehicle} from '../../../Types/api';

interface TripFormProps {
  onCompleted: (trip: MoveTrip) => void;
  route?: MoveLocation;
  vehicle?: MoveVehicle;
}

const TripForm = ({onCompleted, route, vehicle}: TripFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: MoveRoute) => {
    setLoading(true);
    axios
      .request({
        url: route ? `move/trips/${route.uuid}` : 'move/trips',
        method: route ? 'put' : 'post',
        data: {...values, fk_vehicule_uuid: vehicle?.uuid},
      })
      .then(response => {
        setLoading(false);
        if (onCompleted) {
          onCompleted(response.data);
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
        requiredMark={false}
        name="outerForm"
        form={form}
        initialValues={route}
        layout={'vertical'}
        onFinish={submitForm}>
        <Form.Item name={'fk_route_uuid'} label={'Ruta'}>
          <RouteSelector />
        </Form.Item>
        {!vehicle && (
          <Form.Item name={'fk_vehicule_uuid'} label={'Vehículo'}>
            <VehicleSelector />
          </Form.Item>
        )}
        <Form.Item
          name={'departure_time'}
          label={'Fecha y hora'}
          rules={[{required: true, message: 'La dirección es requerida'}]}>
          <DatePicker
            showTime
            placeholder={'Selecciona la fecha y hora'}
            style={{width: '100%'}}
            needConfirm={false}
            showNow={false}
            minuteStep={15}
            format="DD/MM/YYYY - HH:mm"
          />
        </Form.Item>
        {/*
        <Form.Item name={'arrival_time'} label={'Hora de llegada'}>
          <TimePicker use12Hours needConfirm={false} showNow={false} minuteStep={15} format="HH:mm" />
        </Form.Item>
        <Form.Item name={'max_passengers'} label={'Pasajeros máximo'}>
          <InputNumber />
        </Form.Item>
        */}
        <PrimaryButton block icon={<CheckIcon />} loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default TripForm;
