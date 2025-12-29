import React, {useContext, useEffect, useState} from 'react';
import {Input, notification, Select} from "antd";
import {TbSend} from "react-icons/tb";
import axios from "axios";
import {echo} from "@laravel/echo-react";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import type {ChatRoom, Profile} from "../../../Types/api.tsx";
import AuthContext from "../../../Context/AuthContext.tsx";
import './styles.less';

interface ChatBoxProps {
  disabled?: boolean;
  profile?: Profile;
}

const ChatBox = ({disabled, profile}: ChatBoxProps) => {
  const [loading, setLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom>();
  const [reload, setReload] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>();
  const [message, setMessage] = useState<string>();
  const {user, config} = useContext(AuthContext);
  const channel = echo().join(`${config?.id}.chat-rooms.attendance`);

  useEffect(() => {
    channel
      .here((users: any) => setOnlineUsers(users))
      .joining((user: any) => joinUser(user))
      .leaving((user: any) => removeUser(user))
      .listenForWhisper('typing', (e: any) => {
        console.log(e);
      })
    return () => {
      channel.stopListeningForWhisper('typing');
      echo().leave(`${config?.id}.chat-rooms.attendance`);
    }
  }, []);

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

  const joinUser = (user: any) => {
    setOnlineUsers((v) => {
      if (v != undefined) {
        const index = v?.findIndex(u => u.uuid == user.uuid);
        const nV = [...v];
        if (index != undefined) {
          nV.push(user);
        }
        return nV;
      }
    });
  }

  const removeUser = (user: any) => {
    setOnlineUsers((v) => {
      if (v != undefined) {
        const index = v?.findIndex(u => u.uuid == user.uuid);
        const nV = [...v];
        if (index != undefined) {
          nV.splice(index, 1);
        }
        return nV;
      }
    });
  }

  const sendMessage = (messageInput: string) => {
    axios.post(`communication/chat-messages`, {
      message: messageInput,
      content: messageInput
    })
      .then(response => {
        console.log('response', response);
      })
      .catch(error => {
        notification.warning({message: 'La cuenta de Whatsapp no está configurada, no se pueden enviar mensajes'})
      });
  }

  return (
    <div className={'chat-box-container'}>
      <span>{onlineUsers?.map(u => u.name).join(',')}</span>
      <div className={'message-list'}>
      </div>
      <div className={'message-box'}>
        <Input.TextArea
          value={message}
          onChange={e => {
            setMessage(e.target.value);
            channel.whisper('typing', {name: user?.profile.name});
          }}
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
