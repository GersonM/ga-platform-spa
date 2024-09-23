import React from 'react';
import {Tag} from 'antd';
import {MoveTrip} from '../../../Types/api';

interface TripStatusProps {
  trip: MoveTrip;
}

const TripStatus = ({trip}: TripStatusProps) => {
  if (trip.cancelled_at) {
    return <Tag color={'red'}>Cancelado</Tag>;
  }
  if (trip.arrived_at) {
    return <Tag color={'blue'}>Completado</Tag>;
  }
  if (trip.started_at) {
    return <Tag color={'green'}>En progreso...</Tag>;
  }
  if (trip.confirmed_at) {
    return <Tag color={'blue'}>Confirmado</Tag>;
  }
  return <Tag color={'orange'}>Pendiente</Tag>;
};

export default TripStatus;
