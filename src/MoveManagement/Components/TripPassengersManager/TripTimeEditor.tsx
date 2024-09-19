import React, {useState} from 'react';
import {DatePicker, Form, Input} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import axios from 'axios';

import {MoveTrip} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import Config from '../../../Config';

interface TripTimeEditorProps {
  trip: MoveTrip;
  onCompleted: () => void;
}

const TripTimeEditor = ({trip, onCompleted}: TripTimeEditorProps) => {
  const [arrivalTime, setArrivalTime] = useState<Dayjs>();
  const [loading, setLoading] = useState(false);

  const updateTrip = (tripData: any) => {
    setLoading(true);
    console.log({tripData});
    axios
      .put(`move/trips/${trip.uuid}`, {
        departure_time: tripData.departure_time
          ? tripData.departure_time.format(Config.datetimeFormatServer)
          : undefined,
        arrival_time: tripData.arrival_time ? tripData.arrival_time.format(Config.datetimeFormatServer) : undefined,
      })
      .then(response => {
        setLoading(false);
        onCompleted && onCompleted();
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      <Form onFinish={updateTrip}>
        <Form.Item hidden>
          <Input />
        </Form.Item>
        <Form.Item label={'Hora de salida'} name={'departure_time'}>
          <DatePicker
            defaultValue={dayjs(trip.departure_time)}
            showTime
            style={{width: '100%'}}
            needConfirm={false}
            showNow={false}
            format="DD/MM/YYYY - HH:mm"
          />
        </Form.Item>
        <Form.Item label={'Hora de llegada'} name={'arrival_time'}>
          <DatePicker
            defaultValue={dayjs(trip.arrival_time)}
            showTime
            style={{width: '100%'}}
            needConfirm={false}
            showNow={false}
            format="DD/MM/YYYY - HH:mm"
          />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} block />
      </Form>
    </div>
  );
};

export default TripTimeEditor;
