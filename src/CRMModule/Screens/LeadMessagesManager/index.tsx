import React, {useContext, useEffect, useState} from 'react';
import {
  TbArrowRightBar,
  TbArrowRightCircle,
  TbArrowRightToArc,
  TbArrowsSplit,
  TbCalendarCheck,
  TbPlus,
  TbUser
} from "react-icons/tb";
import dayjs from "dayjs";
import {Avatar, Badge, Button, Space} from "antd";

import ModuleSidebar from "../../../CommonUI/ModuleSidebar";
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import NavList, {NavListItem} from "../../../CommonUI/NavList";
import CampaignSelector from "../../../Commercial/Components/CampaignSelector";
import StorageStockChip from "../../../Commercial/Components/StorageStockChip";
import ChatBox from "../../Components/ChatBox";
import type {Campaign, Lead, ResponsePagination} from "../../../Types/api.tsx";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import CustomTag from "../../../CommonUI/CustomTag";
import ModalView from "../../../CommonUI/ModalView";
import CreateLeadForm from "../../../Commercial/Components/CreateLeadForm";
import IconButton from "../../../CommonUI/IconButton";
import {useParams} from "react-router-dom";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import AuthContext from "../../../Context/AuthContext.tsx";

const LeadMessagesManager = () => {
  const [leads, setLeads] = useState<Lead[]>();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [reload, setReload] = useState(false);
  const [openLeadForm, setOpenLeadForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>();
  const [currentLead, setCurrentLead] = useState<Lead>();
  const params = useParams();
  const {user} = useContext(AuthContext);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        //campaign_uuid: params.campaign,
        //page: currentPage,
        //page_size: pageSize,
      },
    };

    setLoading(true);

    axios
      .get(`commercial/leads`, config)
      .then(response => {
        if (response) {
          setLeads(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  useEffect(() => {
    if (params.lead) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
        params: {},
      };

      setLoading(true);

      axios
        .get(`commercial/leads/${params.lead}`, config)
        .then(response => {
          if (response) {
            setCurrentLead(response.data);
          }
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          ErrorHandler.showNotification(error);
        });

      return cancelTokenSource.cancel;
    }
  }, [params.lead]);

  return (
    <>
      <ModuleSidebar
        title={'Mensajes'}
        width={320}
        actions={<><IconButton disabled={!selectedCampaign} icon={<TbPlus/>} small
                               onClick={() => setOpenLeadForm(true)}/></>}
      >
        <CampaignSelector
          style={{width: '100%', marginBottom: 5}} placeholder={'Filtrar por campaña'}
          onChange={val => {
            setSelectedCampaign(val);
          }}
        />
        <NavList>
          {leads?.map((lead: Lead, index) => (
            <NavListItem
              key={index}
              icon={<TbUser/>} name={lead.profile.name}
              tools={<Space>
                <CustomTag>{lead.campaign?.name}</CustomTag>
              </Space>}
              caption={lead.profile.phone + ' | ' + dayjs(lead.created_at).fromNow()}
              path={"/crm/chat/" + lead.uuid}/>
          ))}
        </NavList>
      </ModuleSidebar>
      <ModuleContent withSidebar style={{display: 'flex', flexDirection: 'column'}}>
        <ContentHeader
          bordered
          title={<Space>
            <Avatar src={currentLead?.profile?.avatar?.thumbnail}>22</Avatar>
            <div>
              <h4>{currentLead?.profile.name} {currentLead?.profile.last_name}</h4>
              <small>{currentLead?.profile.phone} | {currentLead?.profile.personal_email || 'Sin mail'}</small>
            </div>
          </Space>}
          tools={<Space split={<TbArrowRightToArc/>}>
            <div>
              Asesor asignado: <br/>
            </div>
            <ProfileChip profile={currentLead?.referer} />
          </Space>}
        >
        </ContentHeader>
        <ChatBox
          disabled={user?.profile.uuid != currentLead?.referer?.uuid}
        />
      </ModuleContent>
      <ModalView
        title={'Nuevo lead'}
        open={openLeadForm} onCancel={() => setOpenLeadForm(false)}>
        <CreateLeadForm
          campaignUuid={selectedCampaign}
          onComplete={() => {
            setReload(!reload);
            setOpenLeadForm(false);
          }}/>
      </ModalView>
    </>
  );
};

export default LeadMessagesManager;
