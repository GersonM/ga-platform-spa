import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import './styles.less';
import {MailFolderPageContent} from '../../../Types/api';

interface ListMailMessagesProps {
  messages: MailFolderPageContent;
}

const ListMailMessages = ({messages}: ListMailMessagesProps) => {
  const params = useParams();

  return (
    <div className={'list-mail-messages-wrapper'}>
      {messages.messages.map(m => {
        return (
          <div key={m.message_id} className={'mail-message-item'}>
            <div className={'sender'}>{m.from[0].mail}</div>
            <div className={'subject'}>{m.subject}</div>
            <div className={'excerpt'}>{m.excerpt}</div>
            <span className={'date'}>{dayjs(m.delivery_date).fromNow()}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ListMailMessages;
