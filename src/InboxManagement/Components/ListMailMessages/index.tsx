import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import './styles.less';
import {MailFolderPageContent} from '../../../Types/api';
import {Segmented} from 'antd';

interface ListMailMessagesProps {
  messages: MailFolderPageContent;
}

const ListMailMessages = ({messages}: ListMailMessagesProps) => {
  const params = useParams();

  return (
    <div className={'list-mail-messages-wrapper'}>
      <div>
        <Segmented
          options={['Ambos', 'Respaldados', 'Sin respaldo']}
          onResize={undefined}
          onResizeCapture={undefined}
        />
      </div>
      {messages.messages.map(m => {
        return (
          <div key={m.message_id} className={'mail-message-item'}>
            <div className={'sender'}>{m.from[0].mail}</div>
            <div className={'subject'}>
              <h4>{m.subject}</h4>
              <small className={'excerpt'}>{m.excerpt.substring(0, 120)}</small>
            </div>
            <span className={'date'}>{dayjs(m.delivery_date).fromNow()}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ListMailMessages;
