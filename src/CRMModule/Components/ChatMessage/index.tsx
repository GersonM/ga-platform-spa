import React from 'react';
import dayjs from "dayjs";

interface ChatMessageProps {
  isSelf?:true;
  message:string|React.ReactNode;
}

const ChatMessage = ({isSelf, message}:ChatMessageProps) => {
  return (
    <div className={`message-bubble ${isSelf && 'own'}`}>
      {message}
      <div className={'message-time'}>{dayjs().format('h:m a')}</div>
    </div>
  );
};

export default ChatMessage;
