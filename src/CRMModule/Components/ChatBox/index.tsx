import React from 'react';
import {Input, Space} from "antd";
import {TbBrandWhatsapp, TbSend} from "react-icons/tb";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import './styles.less';
import dayjs from "dayjs";

const ChatBox = () => {
  return (
    <div className={'chat-box-container'}>
      <div className={'message-list'}>
        <div className={'message-bubble'}>Hola <span className={'message-time'}>{dayjs().format('h:m a')}</span></div>
        <div className={'message-bubble'}>Hola <br/> Este es un mensaje<span className={'message-time'}>{dayjs().format('h:m a')}</span></div>
        <div className={'message-bubble'}>Hola <br/> Este es ua sdfad fasdf adasd n mensaje<span className={'message-time'}>{dayjs().format('h:m a')}</span></div>
        <div className={'message-bubble'}>Hola <br/> Este es un mensaje<span className={'message-time'}>{dayjs().format('h:m a')}</span></div>
        <div className={'message-bubble own'}>Hola <br/> Este es un mensaje<span className={'message-time'}>{dayjs().format('h:m a')}</span></div>
        <div className={'message-bubble own'}>
          <img
            src="https://platform.geekadvice.pe/wayra/storage/file-management/files/f07043f7-7884-4cfe-88f0-76669f8b628b/view?token=121%7CocVgXMbXeda3RK9BVnOvid3ELlGZhyDunnt3ld1R"
            alt=""/>
          <span className={'message-time'}>{dayjs().format('h:m a')}</span></div>
      </div>
      <div className={'message-box'}>
          <Input.TextArea slot={'asdfsf'} placeholder={'Escribe un mensaje y presiona enter para enviar'} />
          <PrimaryButton icon={<TbBrandWhatsapp size={20}/>}/>
      </div>
    </div>
  );
};

export default ChatBox;
