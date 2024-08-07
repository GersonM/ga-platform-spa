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
import './styles.less';

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
      <ContentHeader
        title={'Reserva de pasajes'}
        onRefresh={() => setReload(!reload)}
        onAdd={() => setOpenTripModal(true)}>
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
        items={trips?.map(trip => {
          const percent = trip.vehicle && (trip.total_passengers * 100) / trip.vehicle?.max_capacity;
          return {
            label: (
              <div className={'trip-tab'}>
                <div className={'tab-label'}>
                  {trip.route?.name}
                  <small>
                    {dayjs(trip.departure_time).format('DD/MM hh:mm a')} | {trip.total_passengers} de{' '}
                    {trip.vehicle?.max_capacity}
                  </small>
                </div>
                <Progress percent={Math.round(percent || 0)} type={'circle'} size={25} />
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
