import React, {useState} from 'react';
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
  const [content, setContent] = useState<string>();

  return (
    <div className={'list-mail-messages-wrapper'}>
      {messages.messages.map(m => {
        return (
          <div key={m.message_id} className={'mail-message-item'} onClick={() => setContent(m.body)}>
            <div className={'sender'}>{m.from[0].mail}</div>
            <div className={'subject'}>
              <h4>{m.subject}</h4>
              <small className={'excerpt'}>{m.excerpt.substring(0, 120)}</small>
            </div>
            <span className={'date'}>{dayjs(m.delivery_date).fromNow()}</span>
          </div>
        );
      })}
      {content && <div dangerouslySetInnerHTML={{__html: content}} />}
    </div>
  );
};

export default ListMailMessages;
