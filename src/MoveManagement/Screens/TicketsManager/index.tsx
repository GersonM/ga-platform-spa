import {useEffect, useMemo, useState} from 'react';
import {Collapse, DatePicker, Empty, Modal, Progress, Select, Space} from 'antd';
import axios from 'axios';
import dayjs, {Dayjs} from 'dayjs';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TripForm from '../../Components/TripForm';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {MoveTrip} from '../../../Types/api';
import TripPassengersManager from '../../Components/TripPassengersManager';
import RouteSelector from '../../Components/RouteSelector';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import TripStatus from '../../Components/TripStatus';
import './styles.less';

const TicketsManager = () => {
  const [openTripModal, setOpenTripModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [trips, setTrips] = useState<MoveTrip[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        date: selectedDate?.format('YYYY-MM-DD'),
        route_uuid: selectedRouteUuid,
        status: selectedStatus,
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
  }, [reload, selectedDate, selectedRouteUuid, selectedStatus]);

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

  return (
    <>
      <ContentHeader
        title={'Viajes programados'}
        loading={loading}
        onRefresh={() => setReload(!reload)}
        onAdd={() => setOpenTripModal(true)}>
        <span>Filtros: </span>
        <Space wrap>
          <DatePicker style={{width: 130}} onChange={val => setSelectedDate(val)} />
          <RouteSelector
            style={{width: 190}}
            onChange={value => {
              setSelectedRouteUuid(value);
            }}
          />
          <Select
            style={{width: 120}}
            onChange={val => setSelectedStatus(val)}
            placeholder={'Todos'}
            allowClear
            options={[
              {label: 'Pendientes', value: 'pending'},
              {label: 'Completados', value: 'completed'},
              {label: 'Cancelados', value: 'canceled'},
              {label: 'Confirmados', value: 'confirmed'},
            ]}
          />
        </Space>
      </ContentHeader>
      <LoadingIndicator visible={loading} fitBox={false} message={'Listando viajes...'} />
      {trips && trips.length === 0 && (
        <Empty description={'No hay viajes programados'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      {Object.keys(groupedTrips).map(g => {
        return (
          <div key={g}>
            <div className={'trip-day-divider'}>{groupedTrips[g].date.format('dddd DD [de] MMMM - YYYY')}</div>
            <Collapse
              items={groupedTrips[g].trips?.map((trip: MoveTrip) => {
                const percent = trip.vehicle && (trip.total_passengers * 100) / trip.vehicle?.max_capacity;
                return {
                  extra: (
                    <>
                      <TripStatus trip={trip} />
                      <Progress percent={Math.round(percent || 0)} type={'circle'} size={35} />
                    </>
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
                        </Space>
                      </div>
                    </div>
                  ),
                  key: trip.uuid,
                  children: <TripPassengersManager onChange={() => setReload(!reload)} trip={trip} />,
                };
              })}
            />
          </div>
        );
      })}

      <Modal
        title={'Nuevo viaje'}
        footer={false}
        open={openTripModal}
        destroyOnHidden
        onCancel={() => {
          setOpenTripModal(false);
        }}>
        <TripForm
          onCompleted={() => {
            setReload(!reload);
            setOpenTripModal(false);
          }}
        />
      </Modal>
    </>
  );
};

export default TicketsManager;
