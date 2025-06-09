
import {Tag} from 'antd';
import type {MoveTrip} from '../../../Types/api';

interface TripStatusProps {
  trip: MoveTrip;
}

const TripStatus = ({trip}: TripStatusProps) => {
  if (trip.confirmed_at) {
    return <Tag color={'blue'}>Confirmado</Tag>;
  }

  if (trip.cancelled_at) {
    return <Tag color={'red'}>Cancelado</Tag>;
  }

  if (trip.arrived_at) {
    return <Tag color={'green'}>Completado</Tag>;
  }
  return <Tag color={'orange'}>Pendiente</Tag>;
};

export default TripStatus;
