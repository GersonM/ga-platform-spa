import React, {useState} from 'react';
import {DatePicker, Form} from 'antd';
import {Dayjs} from 'dayjs';
import {EntityActivity} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import SearchProfile from '../../../CommonUI/SearchProfile';

interface ScheduleActivityFormProps {
  activity: EntityActivity;
  onComplete?: () => void;
}

const ScheduleActivityForm = ({activity}: ScheduleActivityFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>();

  const submitForm = () => {};

  return (
    <div>
      <Form layout="vertical">
        <Form.Item name={'profile_uuid'} label={'Responsable'}>
          <SearchProfile />
        </Form.Item>
        <Form.Item name={'date'} label={'Fecha'}>
          <DatePicker onChange={date => setSelectedDate(date)} />
        </Form.Item>
        {selectedDate?.format('YYYY-MM-DD HH:mm:ss')}
      </Form>
    </div>
  );
};

export default ScheduleActivityForm;
