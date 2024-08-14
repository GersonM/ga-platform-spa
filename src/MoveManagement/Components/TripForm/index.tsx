import React, {useState} from 'react';
import {Button, Col, DatePicker, Divider, Form, Popover, Row, Segmented} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RouteSelector from '../RouteSelector';
import VehicleSelector from '../VehicleSelector';
import {MoveLocation, MoveTrip, MoveVehicle} from '../../../Types/api';
import Config from '../../../Config';
import LocationsSelector from '../LocationsSelector';
import {QueueListIcon} from '@heroicons/react/24/outline';

interface TripFormProps {
  onCompleted: (data: any) => void;
  route?: MoveLocation;
  vehicle?: MoveVehicle;
  showVehicle?: boolean;
}

const TripForm = ({onCompleted, route, vehicle, showVehicle}: TripFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: any) => {
    const data = {
      departure_time: values.departure_time.format(Config.datetimeFormatServer),
      arrival_time: values.arrival_time.format(Config.datetimeFormatServer),
      fk_vehicule_uuid: vehicle ? vehicle.uuid : values.fk_vehicle_uuid,
      fk_route_uuid: values.fk_route_uuid,
      location_from: values.location_from,
      location_to: values.location_to,
    };

    if (onCompleted) {
      onCompleted(data);
    }
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
        <Popover
          content={
            <>
              <h3>Elige la ruta</h3>
              <RouteSelector />
            </>
          }>
          <Button block icon={<QueueListIcon />}>
            Cargar ruta previa
          </Button>
        </Popover>
        <Divider>Nueva ruta</Divider>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={'location_from'} label={'Desde'}>
              <LocationsSelector />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'location_to'} label={'Hacia'}>
              <LocationsSelector />
            </Form.Item>
          </Col>
        </Row>
        {!vehicle && showVehicle && (
          <Form.Item name={'fk_vehicule_uuid'} label={'Vehículo'}>
            <VehicleSelector />
          </Form.Item>
        )}
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item
              name={'departure_time'}
              label={'Fecha y hora de inicio'}
              rules={[{required: true, message: 'La dirección es requerida'}]}>
              <DatePicker
                showTime
                style={{width: '100%'}}
                needConfirm={false}
                showNow={false}
                format="DD/MM/YYYY - HH:mm"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'arrival_time'} label={'Fecha y hora de llegada'}>
              <DatePicker
                showTime
                style={{width: '100%'}}
                needConfirm={false}
                showNow={false}
                format="DD/MM/YYYY - HH:mm"
              />
            </Form.Item>
          </Col>
        </Row>
        <PrimaryButton block icon={<CheckIcon />} loading={loading} label={'Continuar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default TripForm;
