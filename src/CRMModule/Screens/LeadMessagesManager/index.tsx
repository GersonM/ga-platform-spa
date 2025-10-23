import React from 'react';
import {TbArrowsSplit, TbCalendarCheck, TbUser} from "react-icons/tb";
import dayjs from "dayjs";
import {Avatar, Badge, Button, Space} from "antd";

import ModuleSidebar from "../../../CommonUI/ModuleSidebar";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import NavList, {NavListItem} from "../../../CommonUI/NavList";
import CampaignSelector from "../../../Commercial/Components/CampaignSelector";
import StorageStockChip from "../../../Commercial/Components/StorageStockChip";
import ChatBox from "../../Components/ChatBox";

const LeadMessagesManager = () => {
  return (
    <>
      <ModuleSidebar title={'Mensajes'}>
        <CampaignSelector style={{width: '100%', marginBottom: 5}} placeholder={'Filtrar por campaña'}/>
        <NavList>
          <NavListItem icon={<TbUser/>} name={'Jorge Ramirez'} caption={dayjs().subtract(2, 'minutes').fromNow()}
                       path={"/crm/chat/123uiyu23-12323-sd"}/>
          <NavListItem
            icon={<TbUser/>} name={'+51998782377'} caption={dayjs().subtract(2, 'hours').fromNow()}
            tools={<Badge count={2}/>}
            path={"/crm/chat/asdf876as7df"}/>
          <NavListItem
            icon={<TbUser/>} name={'Roberto Palacios'} caption={dayjs().subtract(2, 'hours').fromNow()}
            path={"/crm/chat/asdf876as7das-asdf434f"}
            tools={<Space>
              <TbCalendarCheck size={20}/>
              <Badge count={25}/>
            </Space>}
          />
        </NavList>
      </ModuleSidebar>
      <ModuleContent withSidebar style={{display: 'flex', flexDirection: 'column'}}>
        <ContentHeader
          bordered
          title={<Space>
            <Avatar>JR</Avatar>
            <div>
              <h4>Jorge Ramirez</h4>
              <small>+51986776545 | jra@gmail.com</small>
            </div>
          </Space>}
          tools={<Space split={<TbArrowsSplit/>}>
            <StorageStockChip/>
            <div>
              Prospección <br/>
              <small>10 días</small>
            </div>
          </Space>}
        >
        </ContentHeader>
        <ChatBox />
      </ModuleContent>
    </>
  );
};

export default LeadMessagesManager;
