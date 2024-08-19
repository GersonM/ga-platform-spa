import React, {useState} from 'react';
import {Col, DatePicker, Divider, Form, Row} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import {Dayjs} from 'dayjs';

import {MoveLocation, MoveRoute, MoveVehicle} from '../../../Types/api';
import VehicleListSelector from '../../Screens/TripReservation/VehicleListSelector';
import LocationsSelector from '../LocationsSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RouteSelector from '../RouteSelector';
import Config from '../../../Config';

interface TripFormProps {
  onCompleted: (data: any) => void;
  route?: MoveLocation;
  vehicle?: MoveVehicle;
  showVehicle?: boolean;
}

const TripForm = ({onCompleted, route, vehicle, showVehicle = true}: TripFormProps) => {
  const [loading, setLoading] = useState(false);
  const [arrivalDate, setArrivalDate] = useState<Dayjs>();
  const [departureDate, setDepartureDate] = useState<Dayjs>();
  const [selectedRoute, setSelectedRoute] = useState<MoveRoute>();
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

  let startLocation = undefined;
  let endLocation = undefined;

  if (selectedRoute?.locations) {
    startLocation = selectedRoute.locations[0];
    endLocation = selectedRoute.locations[selectedRoute.locations.length - 1];
  }

  return (
    <>
      <Form
        requiredMark={false}
        name="outerForm"
        form={form}
        initialValues={route}
        layout={'vertical'}
        onFinish={submitForm}>
        <h3>Elige la ruta</h3>
        <RouteSelector
          onChange={(_uuid, route) => {
            if (route) {
              setSelectedRoute(route.entity);
            } else {
              setSelectedRoute(undefined);
            }
          }}
        />
        <Divider>Crea una ruta nueva</Divider>
        {selectedRoute?.name}
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={'location_from'} label={'Desde'}>
              <LocationsSelector disabled={!!selectedRoute} placeholder={startLocation?.name} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'location_to'} label={'Hacia'}>
              <LocationsSelector disabled={!!selectedRoute} placeholder={endLocation?.name} />
            </Form.Item>
          </Col>
        </Row>
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
                onChange={date => setDepartureDate(date)}
                showNow={false}
                format="DD/MM/YYYY - HH:mm"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'arrival_time'} label={'Duración'}>
              <DatePicker
                showTime
                style={{width: '100%'}}
                needConfirm={false}
                onChange={date => setArrivalDate(date)}
                showNow={false}
                format="DD/MM/YYYY - HH:mm"
              />
            </Form.Item>
          </Col>
        </Row>
        {!vehicle && showVehicle && (
          <Form.Item name={'fk_vehicle_uuid'} label={'Vehículo'}>
            <VehicleListSelector arrivalTime={arrivalDate} departureTime={departureDate} />
          </Form.Item>
        )}
        <PrimaryButton
          disabled={!arrivalDate || !departureDate}
          block
          icon={<CheckIcon />}
          loading={loading}
          label={'Continuar'}
          htmlType={'submit'}
        />
      </Form>
    </>
  );
};

export default TripForm;
