import {useContext} from 'react';
import {Button, Popconfirm, Space} from 'antd';
import {TrashIcon} from '@heroicons/react/24/solid';
import {PiCalendarXBold, PiCheckBold} from 'react-icons/pi';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {MoveTrip} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import AuthContext from '../../../Context/AuthContext';

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
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const confirmTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/confirm`)
      .then(() => {
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const startTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/start`)
      .then(() => {
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const completeTrip = () => {
    axios
      .post(`move/trips/${trip.uuid}/complete`)
      .then(() => {
        onChange && onChange();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const deleteTrip = () => {
    axios
      .delete(`move/trips/${trip.uuid}`)
      .then(() => {
        onChange && onChange();
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
            icon={<PiCheckBold size={17} />}
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
            icon={<PiCheckBold size={17} />}
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
            icon={<PiCheckBold size={17} />}
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
        <Popconfirm title={'¿Seguro que quieres cancelar este viaje?'} onConfirm={cancelTrip}>
          <Button size={'small'} ghost type={'primary'} icon={<PiCalendarXBold size={18} />} danger>
            Cancelar
          </Button>
        </Popconfirm>
      )}
      {user?.roles?.includes('admin') && (
        <Popconfirm title={'¿Seguro que quieres borrar este viaje?'} onConfirm={deleteTrip}>
          <Button size={'small'} type={'primary'} icon={<TrashIcon />} danger>
            Borrar
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
};

export default TripControls;
