import React from 'react';
import {Alert, Avatar, Divider, Form, Input, notification, Select, Space} from "antd";
import axios from "axios";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {Profile, SubscriptionMember} from "../../../Types/api.tsx";
import CampaignSelector from "../../../Commercial/Components/CampaignSelector";
import ProfileDocument from "../../../CommonUI/ProfileTools/ProfileDocument.tsx";
import InvoicesTable from "../../../PaymentManagement/Components/InvoicesTable";

interface ReportAttendanceProps {
  profile: Profile;
  member?: SubscriptionMember;
  onCompleted?: () => void;
}

const ReportAttendance = ({profile, member, onCompleted}: ReportAttendanceProps) => {
  const registerVisit = (values: any) => {
    const currentProfile = profile || member?.profile;
    axios
      .post('attendances', {...values, profile_uuid: currentProfile?.uuid})
      .then(() => {
        notification.success({message: 'Ingreso registrado', placement: 'top'});
        if (onCompleted) onCompleted();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const currentProfile = profile || member?.profile;
  return (
    <div>
      {currentProfile && currentProfile.uuid &&
        <Space>
          <Avatar size={80} src={currentProfile.avatar?.thumbnail}/> <br/>
          <div>
            {currentProfile.name} {currentProfile.last_name} <br/>
            <ProfileDocument profile={currentProfile}/> <br/>
            N° {member?.subscription?.code}
          </div>
        </Space>
      }
      {!currentProfile.uuid &&
        <Alert message={'Esta persona no está registrada, completa sus datos para registrarla como invitado'} showIcon/>
      }
      <Form layout={'vertical'} style={{marginTop: 20}} onFinish={registerVisit} initialValues={profile}>
        {!currentProfile?.uuid && <>
          <Form.Item label={'Nombre'} name={'name'}>
            <Input/>
          </Form.Item>
          <Form.Item label={'Apellidos'} name={'last_name'}>
            <Input/>
          </Form.Item>
          <Form.Item label={'DNI'} name={'doc_number'}>
            <Input/>
          </Form.Item>
        </>}
        <Form.Item label={'Lugar a visitar (opcional)'} name={'area_uuid'}>
          <Select
            placeholder={'Ingreso al club'}
            options={[
              {value: 'Restaurante', label: 'Restaurante'},
              {value: 'Oficia de atención', label: 'Oficia de atención'},
              {value: 'Club', label: 'Club'},
            ]}
            style={{width: '100%'}}
          />
        </Form.Item>
        <Form.Item label={'Campaña (opcional)'} name={'campaign_uuid'}>
          <CampaignSelector/>
        </Form.Item>
        <Form.Item label={'Código de socio que invita (opcional)'} name={'referer'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
          <Input.TextArea/>
        </Form.Item>
        <PrimaryButton label={'Registrar ingreso'} htmlType={'submit'} block size={'large'}/>
        {member && (<>
            <Divider>Pagos</Divider>
            {member.subscription &&
              <InvoicesTable entityUuid={member.subscription?.uuid} order={'newest'} type={'subscription'}/>
            }
          </>
        )}
      </Form>
    </div>
  )
    ;
};

export default ReportAttendance;
