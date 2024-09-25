import React, {useEffect, useState} from 'react';
import {Calendar, dayjsLocalizer} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import dayjs from 'dayjs';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveTrip} from '../../../Types/api';

const localizer = dayjsLocalizer(dayjs);

const TripsSchedule = () => {
  const [trips, setTrips] = useState<MoveTrip[]>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token, params: {see_old: 1}};

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
  }, [reload]);

  const events = trips?.map(t => {
    return {
      title: (
        <>
          <div style={{marginBottom: 5}}>{t.route?.name}</div>
          <strong>Reservado por:</strong> {t.created_by?.name} {t.created_by?.last_name}
        </>
      ),
      start: dayjs(t.departure_time).toDate(),
      end: dayjs(t.arrival_time).toDate(),
    };
  });

  const calendarLabels = {
    date: 'Date',
    time: 'Time',
    event: 'Evento',
    allDay: 'Todo el día',
    week: 'Semana',
    work_week: 'Semana de trabajo',
    day: 'Día',
    month: 'Mes',
    previous: 'Anterior',
    next: 'Siguiente',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    today: 'Hoy',
    agenda: 'Agenda',
  };

  return (
    <div>
      <ContentHeader title="Programación" onRefresh={() => setReload(!reload)} loading={loading} />
      <div style={{height: 800, width: '100%'}}>
        <Calendar
          messages={calendarLabels}
          defaultView={'agenda'}
          events={events}
          formats={{
            dayFormat: (date, culture, l) => (l ? l.format(date, 'dddd D', culture) : ''),
            timeGutterFormat: (date, culture, l) => (l ? l.format(date, 'hh:mm A', culture) : ''),
          }}
          localizer={localizer}
          startAccessor="start"
          endAccessor="end"
        />
      </div>
    </div>
  );
};

export default TripsSchedule;
