import React, {useEffect, useState} from 'react';
import {DatePicker, Modal, Progress, Space, Tabs} from 'antd';
import axios from 'axios';
import dayjs, {Dayjs} from 'dayjs';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';
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
        <Space style={{marginTop: 10}}>
          <span>Filtros</span>
          <DatePicker onChange={val => setSelectedDate(val)} />
          <RouteSelector onChange={value => setSelectedRouteUuid(value)} />
        </Space>
      </ContentHeader>
      <Tabs
        style={{margin: '0 0 0 -20px'}}
        destroyInactiveTabPane
        tabPosition={'left'}
        items={trips?.map((trip, i) => {
          return {
            label: (
              <div style={{textAlign: 'left'}}>
                <Progress percent={100} type={'circle'} size={25} />
                <div>
                  {trip.route?.name} <br />
                  <small>{dayjs(trip.departure_time).format('DD/MM hh:mm a')}</small>
                </div>
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
