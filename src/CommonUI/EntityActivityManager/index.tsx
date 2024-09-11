import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Empty, Form, Input} from 'antd';
import dayjs from 'dayjs';
import {ChatBubbleLeftIcon} from '@heroicons/react/24/outline';

import ErrorHandler from '../../Utils/ErrorHandler';
import PrimaryButton from '../PrimaryButton';
import './styles.less';

interface EntityActivityManagerProps {
  uuid: string;
  type: string;
}

const EntityActivityManager = ({uuid, type}: EntityActivityManagerProps) => {
  const [activity, setActivity] = useState<any[]>();
  const [message, setMessage] = useState<string>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        type,
      },
    };

    axios
      .get(`entity-activity/${uuid}`, config)
      .then(response => {
        if (response) {
          setActivity(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const submitMessage = () => {
    axios
      .post(`entity-activity`, {message, type, uuid})
      .then(response => {
        setMessage(undefined);
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div className={'activity-wrapper'}>
      {activity?.length == 0 && <Empty description={'Aún no hay actividad'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {activity?.map(a => {
        return (
          <div key={a.uuid} className={'activity-item'}>
            <div className={'author'}>
              <ChatBubbleLeftIcon width={25} /> <br />
            </div>
            <div>
              {a.comment}
              <small>
                {dayjs(a.created_at).format('dddd DD MMMM/YYYY h:m')} por {a.profile.name}
              </small>
            </div>
          </div>
        );
      })}
      <Form onFinish={submitMessage}>
        <Form.Item>
          <Input
            onPressEnter={event => {
              console.log(event.ctrlKey, 'asdfasdf');
            }}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </Form.Item>
        <PrimaryButton label={'Enviar'} block htmlType={'submit'} />
      </Form>
    </div>
  );
};

export default EntityActivityManager;
