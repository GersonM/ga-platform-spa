import React, {useEffect, useState} from 'react';
import {MoveTrip} from '../../../Types/api';
import dayjs from 'dayjs';
import {Breadcrumb, Divider, Modal, Space, Tag} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {PlusIcon} from '@heroicons/react/24/solid';

interface TripPassengersManagerProps {
  trip: MoveTrip;
}

const TripPassengersManager = ({trip}: TripPassengersManagerProps) => {
  const [passengers, setPassengers] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [openPassengerModal, setOpenPassengerModal] = useState(false);

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

  return (
    <>
      <h3>
        {dayjs(trip.departure_time).format('hh:mm a')} :: {trip.route?.name}
      </h3>
      <Breadcrumb items={trip.route?.locations?.map(location => ({title: location.name}))} />
      <Divider />
      <PrimaryButton icon={<PlusIcon />} onClick={() => setOpenPassengerModal(true)} label={'Agregar pasajero'} />
      <Modal
        title={'Nuevo pasajero'}
        footer={false}
        open={openPassengerModal}
        destroyOnClose
        onCancel={() => {
          setOpenPassengerModal(false);
        }}></Modal>
    </>
  );
};

export default TripPassengersManager;
