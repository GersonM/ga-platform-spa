import React, {useState} from 'react';
import {Col, DatePicker, Divider, Form, Input, Row, Space, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import {IoInformationCircle} from 'react-icons/io5';
import timeString from 'timestring';
import {Dayjs} from 'dayjs';
import axios from 'axios';

import {MoveLocation, MoveRoute, MoveVehicle} from '../../../Types/api';
import VehicleListSelector from '../../Screens/TripReservation/VehicleListSelector';
import LocationsSelector from '../LocationsSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RouteSelector from '../RouteSelector';
import ErrorHandler from '../../../Utils/ErrorHandler';
import Config from '../../../Config';

interface TripFormProps {
  onCompleted: (data: any) => void;
  route?: MoveLocation;
  vehicle?: MoveVehicle;
  loading?: boolean;
  showVehicle?: boolean;
}

const TripForm = ({onCompleted, route, vehicle, loading, showVehicle = true}: TripFormProps) => {
  const [arrivalDate, setArrivalDate] = useState<Dayjs>();
  const [departureDate, setDepartureDate] = useState<Dayjs>();
  const [selectedRoute, setSelectedRoute] = useState<MoveRoute>();
  const [form] = useForm();
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [creatingTrip, setCreatingTrip] = useState(false);

  const submitForm = (values: any) => {
    const departure: Dayjs = values.departure_time;
    const data = {
      departure_time: values.departure_time.format(Config.datetimeFormatServer),
      arrival_time: departure.add(durationSeconds, 's').format(Config.datetimeFormatServer),
      fk_vehicule_uuid: vehicle ? vehicle.uuid : values.fk_vehicle_uuid,
      fk_route_uuid: selectedRoute?.uuid,
      location_from: values.location_from,
      location_to: values.location_to,
    };

    axios
      .post('move/trips', data)
      .then(response => {
        setCreatingTrip(false);
        if (onCompleted) {
          onCompleted(response.data);
        }
      })
      .catch(error => {
        setCreatingTrip(false);
        ErrorHandler.showNotification(error);
      });
  };

  const addTime = (time: string, reset: boolean = false) => {
    if (time === '' && reset) {
      setDurationSeconds(0);
      return;
    }
    const parseTime = timeString(time) + (reset ? 0 : durationSeconds);
    setDurationSeconds(parseTime);
    setArrivalDate(departureDate?.add(durationSeconds, 's'));
    form.setFieldValue('duration', timeToString(parseTime));
  };

  const timeToString = (seconds: number) => {
    let date = new Date(seconds * 1000);
    let hh = date.getUTCHours();
    let mm = date.getUTCMinutes();
    return hh > 0 ? hh + 'h ' : '' + (mm > 0) ? mm + 'm' : '';
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
            <Form.Item
              name={'duration'}
              label={
                <>
                  Duración
                  <Tooltip title={'Eje: 2h 45m'}>
                    <IoInformationCircle style={{fontSize: 18, marginLeft: 5}} />
                  </Tooltip>
                </>
              }>
              <Input
                allowClear
                value={durationSeconds}
                onChange={event => addTime(event.target.value, true)}
                addonAfter={
                  <Space>
                    <PrimaryButton onClick={() => addTime('10m')} label={'+10m'} size={'small'} ghost />
                    <PrimaryButton onClick={() => addTime('1h')} label={'+1h'} size={'small'} ghost />
                  </Space>
                }
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
          disabled={!departureDate}
          block
          icon={<CheckIcon />}
          loading={creatingTrip || loading}
          label={'Continuar'}
          htmlType={'submit'}
        />
      </Form>
    </>
  );
};

export default TripForm;
