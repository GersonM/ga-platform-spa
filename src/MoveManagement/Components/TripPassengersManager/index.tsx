import React, {useContext, useEffect, useState} from 'react';
import {Breadcrumb, Divider, Modal} from 'antd';
import {PlusIcon, TrashIcon} from '@heroicons/react/16/solid';
import dayjs from 'dayjs';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import RegisterPassenger from '../RegisterPassenger';
import IconButton from '../../../CommonUI/IconButton';
import {MoveDriver, MoveTrip} from '../../../Types/api';
import './styles.less';
import {UserPlusIcon} from '@heroicons/react/24/solid';
import AuthContext from '../../../Context/AuthContext';
import DriverSelector from '../../../CommonUI/DriverSelector';

interface TripPassengersManagerProps {
  trip: MoveTrip;
  onChange?: () => void;
}

const TripPassengersManager = ({trip}: TripPassengersManagerProps) => {
  const {user} = useContext(AuthContext);
  const [passengers, setPassengers] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [openPassengerModal, setOpenPassengerModal] = useState(false);
  const [openAssignDriver, setOpenAssignDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<MoveDriver>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {trip_uuid: trip.uuid},
    };

    axios
      .get(`move/passengers`, config)
      .then(response => {
        if (response) {
          setPassengers(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const removePassenger = (uuid: string) => {
    axios
      .delete(`move/passengers/${uuid}`)
      .then(response => {
        if (response) {
          setReload(!reload);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const assignDriver = () => {
    axios
      .post(`move/trips/${trip.uuid}/assign-driver`, {driver_uuid: selectedDriver?.uuid})
      .then(() => {
        setOpenAssignDriver(false);
        setReload(!reload);
        setSelectedDriver(undefined);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const isAbleToAssignDriver = user?.roles?.includes('admin') || user?.roles?.includes('operator');

  return (
    <>
      <div className={'trip-card'}>
        <div>
          <h3>
            {dayjs(trip.departure_time).format('hh:mm a')} :: {trip.route?.name}
          </h3>
          <Breadcrumb items={trip.route?.locations?.map(location => ({title: location.name}))} />
        </div>
        {trip.driver ? (
          <div>
            {trip.driver.profile?.name} {trip.driver.profile?.last_name} <br />
            {trip.driver.profile?.doc_type}: {trip.driver.profile?.doc_number}
          </div>
        ) : (
          isAbleToAssignDriver && (
            <PrimaryButton
              onClick={() => setOpenAssignDriver(true)}
              label={'Asignar conductor'}
              icon={<UserPlusIcon />}
              ghost
            />
          )
        )}
      </div>
      <Divider />
      <PrimaryButton
        block
        disabled={!trip.vehicle || !(trip.total_passengers < trip.vehicle?.max_capacity)}
        icon={<PlusIcon />}
        onClick={() => setOpenPassengerModal(true)}
        label={'Agregar pasajero'}
      />
      {passengers?.map(p => {
        return (
          <div key={p.uuid} className={'passenger-item'}>
            <div>
              {p.profile.name} {p.profile.last_name} <br />
              <small>{p.ledger}</small>
            </div>
            <div>
              <IconButton danger icon={<TrashIcon />} onClick={() => removePassenger(p.uuid)} />
            </div>
          </div>
        );
      })}
      <Modal
        footer={false}
        title={'Asignar conductor'}
        open={openAssignDriver}
        destroyOnClose
        onCancel={() => {
          setOpenAssignDriver(false);
          setReload(!reload);
        }}>
        <p>
          Asigna el conductor para esta reserva, al momento de asignar el conductor se enviará una notificación a todos
          los usuarios
        </p>
        <DriverSelector
          placeholder={'Buscar conductor'}
          onChange={(_value, item) => setSelectedDriver(item.entity)}
          style={{width: '100%', marginBottom: 15}}
        />
        <PrimaryButton disabled={!selectedDriver} block label={'Asignar conductor'} onClick={assignDriver} />
      </Modal>
      <Modal
        footer={false}
        open={openPassengerModal}
        destroyOnClose
        onCancel={() => {
          setOpenPassengerModal(false);
        }}>
        <RegisterPassenger
          trip={trip}
          onComplete={() => {
            setOpenPassengerModal(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </>
  );
};

export default TripPassengersManager;
