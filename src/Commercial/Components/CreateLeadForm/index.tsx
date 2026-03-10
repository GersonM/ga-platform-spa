import React, {useEffect, useState} from 'react';
import {Card, Form, Input, notification} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {Lead, Profile} from '../../../Types/api';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import EntityFieldsEditor from "../../../TaxonomyManagement/Components/EntityFieldsEditor";
import ProfileSelector from "../../../CommonUI/ProfileSelector";
import CommercialProcessStageSelector from "../../../CRMModule/Components/CommercialProcessStageSelector";

interface CreateLeadFormProps {
  onComplete?: () => void;
  campaignUuid?: string;
  lead?: Lead;
}

const CreateLeadForm = ({onComplete, campaignUuid, lead}: CreateLeadFormProps) => {
  const [searchProfile, setSearchProfile] = useState<string>();
  const lastSearchText = useDebounce(searchProfile, 400);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [saving, setSaving] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    if (!lastSearchText || lastSearchText.length < 4) {
      return;
    }

    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {search: lastSearchText},
    };

    setLoading(true);
    axios
      .get('hr-management/profiles', config)
      .then(response => {
        if (response) {
          setLoading(false);
          setProfiles(response.data.data);
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });

    return cancelTokenSource.cancel;
  }, [lastSearchText]);

  useEffect(() => {
    form.resetFields();
  }, [selectedProfile]);

  const createLead = (values: any) => {
    const data = {campaign_uuid: campaignUuid, ...values};
    setSaving(true);
    axios
      .request({
        url: lead ? `commercial/leads/${lead.uuid}` : 'commercial/leads',
        method: lead ? 'PUT' : 'POST',
        data,
      })
      .then(_res => {
        setSelectedProfile(undefined);
        setSaving(false);
        form.resetFields();
        setProfiles(undefined);
        if (onComplete) onComplete();
        notification.success({message: lead ? 'Ingreso actualizado' : 'Ingreso registrado'});
      })
      .catch(e => {
        setSaving(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div>
      <LoadingIndicator visible={saving} message={'Guardando datos'}/>
      <Form form={form} layout={'vertical'} initialValues={lead} onFinish={createLead}>
        <Form.Item name={'profile_uuid'} label={'Persona'} rules={[{required: true}]}>
          <ProfileSelector/>
        </Form.Item>
        <Form.Item name={'observations'} label={'Observaciones'}>
          <Input.TextArea/>
        </Form.Item>
        <Form.Item name={'process_stage_uuid'} label={'Etapa'}>
          <CommercialProcessStageSelector/>
        </Form.Item>
        <Form.Item name={'attributes'} label={'Atributos'}>
          <EntityFieldsEditor entity={lead}/>
        </Form.Item>
        {/*
        <Form.Item name={'email'} label={'E-mail (opcional)'}>
          <Input />
        </Form.Item>
        <Form.Item name={'addons'} label={'Información adicional'}>
          <Checkbox.Group>
            <Checkbox value={'Está interesado en comprar'}>Está interesado en comprar</Checkbox>
            <Checkbox value={'Es socio'}>Es socio</Checkbox>
            <Checkbox value={'Tiene familia'}>Tiene familia</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        */}
        <PrimaryButton
          icon={<CheckIcon/>}
          loading={saving}
          size={'large'}
          label={lead ? 'Guardar cambios' : 'Registrar ingreso'}
          htmlType={'submit'}
          block
        />
      </Form>
    </div>
  );
};

export default CreateLeadForm;
