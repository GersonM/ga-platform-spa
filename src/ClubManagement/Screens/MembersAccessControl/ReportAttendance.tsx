import React from 'react';
import {Alert, Avatar, Form, Input, notification, Select} from "antd";
import axios from "axios";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {Profile} from "../../../Types/api.tsx";
import CampaignSelector from "../../../Commercial/Components/CampaignSelector";
import ProfileDocument from "../../../CommonUI/ProfileTools/ProfileDocument.tsx";

interface ReportAttendanceProps {
  profile: Profile;
  onCompleted?: () => void;
}

const ReportAttendance = ({profile, onCompleted}: ReportAttendanceProps) => {
  const [api, contextHolder] = notification.useNotification();

  const registerVisit = (values: any) => {
    axios
      .post('attendances', {...values, profile_uuid: profile.uuid})
      .then(() => {
        api.success({message: 'Ingreso registrado', placement: 'top'});
        if (onCompleted) onCompleted();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      {contextHolder}
      {profile && profile.name}
      {profile && profile.uuid &&
        <h2 style={{textAlign: 'center'}}>
          {profile.name} {profile.last_name} <br/>
          <ProfileDocument profile={profile}/>
        </h2>
      }
      <Alert message={'Esta persona no está registrada'} showIcon />
      <Form layout={'vertical'} style={{marginTop: 20}} onFinish={registerVisit} initialValues={profile}>
      {profile && !profile.uuid && <>
        <Form.Item label={'Nombre'} name={'name'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Nombre'} name={'last_name'}>
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
      <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
        <Input.TextArea/>
      </Form.Item>
      <PrimaryButton label={'Registrar ingreso'} htmlType={'submit'} block size={'large'}/>
    </Form>
</div>
)
  ;
};

export default ReportAttendance;
