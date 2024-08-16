import React from 'react';
import {MoveTrip} from '../../../Types/api';
import {Tag} from 'antd';
import {ClockIcon} from '@heroicons/react/24/outline';

interface TripStatusProps {
  trip: MoveTrip;
}

const TripStatus = ({trip}: TripStatusProps) => {
  if (trip.confirmed_at) {
    return <Tag color={'orange'}>Confirmado</Tag>;
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
