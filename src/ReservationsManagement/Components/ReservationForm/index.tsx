import {useState} from 'react';
import {Col, DatePicker, Form, Row, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import {IoInformationCircle} from 'react-icons/io5';
import {Dayjs} from 'dayjs';
import axios from 'axios';

import {MoveLocation, MoveRoute, MoveVehicle} from '../../../Types/api';
import VehicleListSelector from '../../Screens/NewReservation/VehicleListSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RouteSelector from '../RouteSelector';
import ErrorHandler from '../../../Utils/ErrorHandler';
import Config from '../../../Config';
import TimeInput from '../../../CommonUI/TimeInput';

interface TripFormProps {
  onCompleted: (data: any) => void;
  route?: MoveLocation;
  vehicle?: MoveVehicle;
  loading?: boolean;
  showVehicle?: boolean;
}

const ReservationForm = ({onCompleted, route, vehicle, loading, showVehicle = true}: TripFormProps) => {
  const [arrivalDate, setArrivalDate] = useState<Dayjs>();
  const [departureDate, setDepartureDate] = useState<Dayjs>();
  const [selectedRoute, setSelectedRoute] = useState<MoveRoute>();
  const [form] = useForm();
  const [creatingTrip, setCreatingTrip] = useState(false);

  const submitForm = (values: any) => {
    const departure: Dayjs = values.departure_time;
    const data = {
      departure_time: values.departure_time.format(Config.datetimeFormatServer),
      arrival_time: departure.add(values.duration, 's').format(Config.datetimeFormatServer),
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

  return (
    <>
      <Form
        requiredMark={false}
        name="outerForm"
        form={form}
        initialValues={route}
        layout={'vertical'}
        onFinish={submitForm}>
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
            <Form.Item name={'duration'} tooltip={'Eje: 2h 45m'} label={'Duración'}>
              <TimeInput
                onChange={value => {
                  setArrivalDate(departureDate?.add(value, 's'));
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={'Servicio'}>
          <RouteSelector
            placeholder={'Tipo de servicio'}
            onChange={(_uuid, route) => {
              if (route) {
                setSelectedRoute(route.entity);
              } else {
                setSelectedRoute(undefined);
              }
            }}
          />
        </Form.Item>
        {!vehicle && showVehicle && (
          <Form.Item name={'fk_vehicle_uuid'} label={'Ambiente'}>
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

export default ReservationForm;
