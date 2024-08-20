import React, {useState} from 'react';
import {Col, DatePicker, Divider, Form, Input, Row, Space} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import {Dayjs} from 'dayjs';
import timeString from 'timestring';

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
  const [durationMinutes, setDurationMinutes] = useState<number>(0);

  const submitForm = (values: any) => {
    const departure: Dayjs = values.departure_time;
    const data = {
      departure_time: values.departure_time.format(Config.datetimeFormatServer),
      arrival_time: departure.add(durationMinutes, 's').format(Config.datetimeFormatServer),
      fk_vehicule_uuid: vehicle ? vehicle.uuid : values.fk_vehicle_uuid,
      fk_route_uuid: selectedRoute?.uuid,
      location_from: values.location_from,
      location_to: values.location_to,
    };

    if (onCompleted) {
      onCompleted(data);
    }
  };

  const addTime = (time: string, reset: boolean = false) => {
    const parseTime = timeString(time) + (reset ? 0 : durationMinutes);
    setDurationMinutes(parseTime);
    form.setFieldValue('duration', timeToString(parseTime));
  };

  const timeToString = (seconds: number) => {
    let date = new Date(seconds * 1000);
    let hh = date.getUTCHours();
    let mm = date.getUTCMinutes();

    let t = '';
    if (hh > 0) {
      t += hh + 'h ';
    }
    if (mm > 0) {
      t += mm + 'm';
    }
    return t;
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
            <Form.Item name={'duration'} label={'Duración'}>
              <Input
                value={durationMinutes}
                onChange={event => addTime(event.target.value, true)}
                addonAfter={
                  <>
                    <Space>
                      <PrimaryButton onClick={() => addTime('10m')} label={'+10m'} size={'small'} ghost />
                      <PrimaryButton onClick={() => addTime('1h')} label={'+1h'} size={'small'} ghost />
                    </Space>
                  </>
                }
              />
            </Form.Item>
            {durationMinutes} - {timeToString(durationMinutes)}
          </Col>
        </Row>
        {!vehicle && showVehicle && (
          <Form.Item name={'fk_vehicle_uuid'} label={'Vehículo'}>
            <VehicleListSelector arrivalTime={arrivalDate} departureTime={departureDate} />
          </Form.Item>
        )}
        <PrimaryButton
          disabled={!departureDate}
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
