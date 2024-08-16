import React, {useEffect, useMemo, useState} from 'react';
import {Collapse, DatePicker, Empty, Modal, Progress, Space, Tabs, Tag} from 'antd';
import axios from 'axios';
import dayjs, {Dayjs} from 'dayjs';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';
import TripPassengersManager from '../../Components/TripPassengersManager';
import RouteSelector from '../../Components/RouteSelector';
import './styles.less';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import TripStatus from '../../Components/TripStatus';

const TicketsManager = () => {
  const [openTripModal, setOpenTripModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string>();
  const [trips, setTrips] = useState<MoveTrip[]>();
  const [loading, setLoading] = useState(false);
  //const [tripsGroped, setTripsGrouped] = useState<MoveTrip[][]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        date: selectedDate?.format('YYYY-MM-DD'),
        route_uuid: selectedRouteUuid,
      },
    };
    setLoading(true);
    axios
      .get(`move/trips`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setTrips(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, selectedDate, selectedRouteUuid]);

  const groupedTrips = useMemo(() => {
    const groups: any = {};
    trips?.forEach(t => {
      const dateKey: string = dayjs(t.departure_time).format('YYYY_MM_DD');
      if (!groups[dateKey]) {
        groups[dateKey] = {date: dayjs(t.departure_time), trips: []};
      }
      groups[dateKey].trips.push(t);
    });
    return groups;
  }, [trips]);

  console.log('render', groupedTrips);

  return (
    <>
      <ContentHeader
        title={'Viajes programados'}
        loading={loading}
        onRefresh={() => setReload(!reload)}
        onAdd={() => setOpenTripModal(true)}>
        <Space style={{marginTop: 10}}>
          <span>Filtros</span>
          <DatePicker style={{width: 140}} onChange={val => setSelectedDate(val)} />
          <RouteSelector
            style={{width: 200}}
            onChange={value => {
              setSelectedRouteUuid(value);
            }}
          />
        </Space>
      </ContentHeader>
      <LoadingIndicator visible={loading} message={'Listando viajes...'} />
      {trips && trips.length === 0 && (
        <Empty description={'No hay viajes programados'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      {Object.keys(groupedTrips).map(g => {
        return (
          <>
            <div className={'trip-day-divider'}>{groupedTrips[g].date.format('dddd DD [de] MMMM - YYYY')}</div>
            <Collapse
              items={groupedTrips[g].trips?.map((trip: MoveTrip) => {
                const percent = trip.vehicle && (trip.total_passengers * 100) / trip.vehicle?.max_capacity;
                return {
                  extra: (
                    <Space>
                      <Progress percent={Math.round(percent || 0)} type={'circle'} size={35} />
                    </Space>
                  ),
                  label: (
                    <div className={'trip-tab'}>
                      <div>
                        <div className={'departure-time'}>
                          {dayjs(trip.departure_time).format('hh:mm')} <br />
                          <span>{dayjs(trip.departure_time).format('A')}</span>
                        </div>
                      </div>
                      <div className={'tab-label'}>
                        {trip.route?.name} <br />
                        <Space>
                          <small>
                            Reservado por: {trip.created_by?.name} {trip.created_by?.last_name} |{' '}
                            {trip.total_passengers} de {trip.vehicle?.max_capacity}
                          </small>
                          <TripStatus trip={trip} />
                        </Space>
                      </div>
                    </div>
                  ),
                  key: trip.uuid,
                  children: <TripPassengersManager onChange={() => setReload(!reload)} trip={trip} />,
                };
              })}
            />
          </>
        );
      })}

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
