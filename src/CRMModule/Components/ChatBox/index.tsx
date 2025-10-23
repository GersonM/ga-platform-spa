import React, {useEffect, useState} from 'react';
import {Image, Input, Select} from "antd";
import {TbSend} from "react-icons/tb";
import dayjs from "dayjs";
import axios from "axios";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import type {ChatRoom, Profile} from "../../../Types/api.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import './styles.less';

interface ChatBoxProps {
  disabled?: boolean;
  profile?: Profile;
}

const ChatBox = ({disabled, profile}: ChatBoxProps) => {
  const [loading, setLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom>();
  const [reload, setReload] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`communication/chat-rooms`, config)
      .then(response => {
        if (response) {
          setChatRoom(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const sendMessage = (messageInput: string) => {
    axios.post(`communication/chat-messages`, {
      message: messageInput,
      content: messageInput
    })
      .then(response => {
        console.log('response', response);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  }

  return (
    <div className={'chat-box-container'}>
      <div className={'message-list'}>
        <div className={'message-bubble'}>Hola <div className={'message-time'}>{dayjs().format('h:m a')}</div></div>
        <div className={'message-bubble'}>Busco información sobre un producto
          <div className={'message-time'}>{dayjs().format('h:m a')}</div>
        </div>
        <div className={'message-bubble own'}>
          Buenos días {profile?.name} <br/> <br/>
          Tenemos información para ofrecerle sobre las propiedad en nuestro Proyecto TERRA

          <div className={'message-time'}>{dayjs().format('h:m a')}</div>
        </div>
        <div className={'message-bubble'}>Si, donde est+a ubicado?
          <div className={'message-time'}>{dayjs().format('h:m a')}</div>
        </div>
        <div className={'message-bubble own'}>
          Le adjunto un mapa de la ubicación
          <div className={'message-time'}>{dayjs().format('h:m a')}</div>
        </div>
        <div className={'message-bubble own'}>
          <Image src={'https://platform.geekadvice.pe/wayra/storage/file-management/files/f07043f7-7884-4cfe-88f0-76669f8b628b/view?token=121%7CocVgXMbXeda3RK9BVnOvid3ELlGZhyDunnt3ld1R'}/>
          <div className={'message-time'}>{dayjs().format('h:mm a')}</div>
        </div>
      </div>
      <div className={'message-box'}>
        <div>
        </div>
        <Input.TextArea
          disabled={disabled}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onPressEnter={value => {
            // @ts-ignore
            sendMessage(value.target.value);
            setMessage(undefined);
            value.preventDefault();
          }}
          placeholder={'Escribe un mensaje y presiona enter para enviar'}/>

        <PrimaryButton
          disabled={disabled}
          style={{width: 100}} icon={<TbSend size={20}/>}/>
        <Select
          placeholder={'Enviar plantilla'}
          style={{width: 90}}
          options={[
            {value: 'bienvenida', label: 'Bienvenida'},
          ]}/>
      </div>
    </div>
  );
};

export default ChatBox;
