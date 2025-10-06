import {useContext} from 'react';
import {Button, Popconfirm, Space} from 'antd';
import {TrashIcon} from '@heroicons/react/24/solid';
import {PiCalendarXBold, PiCheckBold} from 'react-icons/pi';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {MoveTrip} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import AuthContext from '../../../Context/AuthContext';
import {TbTrash} from "react-icons/tb";

interface TripControlsProps {
  onChange?: () => void;
  trip: MoveTrip;
}

const TripControls = ({onChange, trip}: TripControlsProps) => {
  const {user} = useContext(AuthContext);

  const cancelTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/cancel`)
      .then(() => {
        if(onChange) onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const confirmTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/confirm`)
      .then(() => {
        if(onChange) onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const startTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/start`)
      .then(() => {
        if(onChange) onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const completeTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/complete`)
      .then(() => {
        if(onChange) onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const deleteTrip = () => {
    axios
      .delete(`move/trips/${trip.uuid}`)
      .then(() => {
        if(onChange) onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const getTripButton = () => {
    switch (true) {
      case trip.confirmed_at === null:
        return (
          <PrimaryButton
            ghost
            size={'small'}
            disabled={!trip.vehicle}
            icon={<PiCheckBold />}
            onClick={confirmTrip}
            label={'Confirmar'}
          />
        );
      case trip.started_at === null:
        return (
          <PrimaryButton
            ghost
            size={'small'}
            disabled={!trip.vehicle}
            icon={<PiCheckBold />}
            onClick={startTrip}
            label={'Iniciar servicio'}
          />
        );
      case trip.arrived_at === null:
        return (
          <PrimaryButton
            ghost
            size={'small'}
            disabled={!trip.vehicle}
            icon={<PiCheckBold />}
            onClick={completeTrip}
            label={'Completar viaje'}
          />
        );
    }
  };

  return (
    <Space wrap>
      {(user?.roles?.includes('driver') || user?.roles?.includes('admin')) && !trip.arrived_at && getTripButton()}

      {!trip.arrived_at && (
        <Popconfirm title={'¿Seguro que quieres cancelar esta reserva?'} onConfirm={cancelTrip}>
          <Button size={'small'} ghost type={'primary'} icon={<PiCalendarXBold />} danger>
            Cancelar
          </Button>
        </Popconfirm>
      )}
      {user?.roles?.includes('admin') && (
        <Popconfirm title={'¿Seguro que quieres borrar esta reserva?'} onConfirm={deleteTrip}>
          <Button size={'small'} type={'primary'} icon={<TbTrash />} danger>
            Borrar
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
};

export default TripControls;
