import React, {useEffect, useState} from 'react';
import {Modal, Tabs} from 'antd';
import axios from 'axios';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';

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
        tabPosition={'left'}
        items={trips?.map((trip, i) => {
          return {
            label: (
              <>
                {trip.route?.name} <br />
                <small>{trip.departure_time}</small>
              </>
            ),
            key: trip.uuid,
            children: `Content of Tab ${trip.route?.name}`,
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
