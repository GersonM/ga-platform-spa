import React, {useEffect, useState} from 'react';
import {Modal, Tabs} from 'antd';
import axios from 'axios';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';
import dayjs from 'dayjs';
import TripPassengersManager from '../../Components/TripPassengersManager';

const TicketsManager = () => {
  const [openTripModal, setOpenTripModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [trips, setTrips] = useState<MoveTrip[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/trips`, config)
      .then(response => {
        if (response) {
          setTrips(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  return (
    <>
      <ContentHeader title={'Venta de pasajes'} onAdd={() => setOpenTripModal(true)} />
      <Tabs
        destroyInactiveTabPane
        tabPosition={'left'}
        items={trips?.map((trip, i) => {
          return {
            label: (
              <div style={{textAlign: 'left'}}>
                {trip.route?.name} <br />
                <small>{dayjs(trip.departure_time).format('hh:mm a')}</small>
              </div>
            ),
            key: trip.uuid,
            children: <TripPassengersManager trip={trip} />,
          };
        })}
      />
      <Modal
        title={'Nuevo viaje'}
        footer={false}
        open={openTripModal}
        destroyOnClose
        onCancel={() => {
          setOpenTripModal(false);
        }}>
        <TripForm onCompleted={() => setReload(!reload)} />
      </Modal>
    </>
  );
};

export default TicketsManager;
