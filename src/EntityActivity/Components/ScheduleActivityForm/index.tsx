import {useContext, useState} from 'react';
import {DatePicker, Form} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import type {EntityActivity} from '../../../Types/api';
import SearchProfile from '../../../CommonUI/SearchProfile';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import AuthContext from '../../../Context/AuthContext';

interface ScheduleActivityFormProps {
  activity: EntityActivity;
  onComplete?: () => void;
}

const ScheduleActivityForm = ({activity, onComplete}: ScheduleActivityFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const {updateActivityCount} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [_form] = useForm();

  const submitForm = (data: any) => {
    axios
      .put(`/entity-activity/${activity.uuid}/`, data)
      .then(_response => {
        setLoading(false);
        onComplete && onComplete();
        updateActivityCount && updateActivityCount();
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      <Form layout="vertical" onFinish={submitForm}>
        <Form.Item name={'assigned_uuid'} label={'Responsable'}>
          <SearchProfile />
        </Form.Item>
        <Form.Item
          name={'expired_at'}
          label={'Fecha'}
          initialValue={activity.expired_at ? dayjs(activity.expired_at) : undefined}>
          <DatePicker style={{width: '100%'}} onChange={date => setSelectedDate(date)} />
        </Form.Item>
        {selectedDate?.format('YYYY-MM-DD HH:mm:ss')}
        <PrimaryButton htmlType={'submit'} block label={'Guardar'} loading={loading} />
      </Form>
    </div>
  );
};

export default ScheduleActivityForm;
