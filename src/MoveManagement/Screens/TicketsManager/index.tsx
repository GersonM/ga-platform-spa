import React, {useEffect, useState} from 'react';
import {DatePicker, Modal, Space, Tabs} from 'antd';
import axios from 'axios';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';
import dayjs, {Dayjs} from 'dayjs';
import TripPassengersManager from '../../Components/TripPassengersManager';
import RouteSelector from '../../Components/RouteSelector';

const TicketsManager = () => {
  const [openTripModal, setOpenTripModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string>();
  const [trips, setTrips] = useState<MoveTrip[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        date: selectedDate?.format('YYYY-MM-DD'),
        route_uuid: selectedRouteUuid,
      },
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
  }, [reload, selectedDate]);

  return (
    <>
      <ContentHeader title={'Reserva de pasajes'} onAdd={() => setOpenTripModal(true)}>
        <Space>
          <p>Filtros</p>
          <DatePicker onChange={val => setSelectedDate(val)} />
          <RouteSelector onChange={value => setSelectedRouteUuid(value)} />
        </Space>
      </ContentHeader>
      <Tabs
        destroyInactiveTabPane
        tabPosition={'left'}
        items={trips?.map((trip, i) => {
          return {
            label: (
              <div style={{textAlign: 'left'}}>
                {trip.route?.name} <br />
                <small>{dayjs(trip.departure_time).format('DD/MM hh:mm a')}</small>
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
