import React, {useEffect, useState} from 'react';
import {Card, Checkbox, Form, Input, InputNumber} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import {useForm} from 'antd/lib/form/Form';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Profile} from '../../../Types/api';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

interface CreateLeadFormProps {
  onComplete?: () => void;
  campaignUuid?: string;
}

const CreateLeadForm = ({onComplete, campaignUuid}: CreateLeadFormProps) => {
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
        setLoading(false);
        setProfiles(response.data.data);
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
      .post('commercial/leads', data)
      .then(res => {
        setSelectedProfile(undefined);
        setSaving(false);
        onComplete && onComplete();
      })
      .catch(e => {
        setSaving(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div>
      <LoadingIndicator visible={saving} message={'Guardando datos'} />
      {searchProfile && profiles && profiles.length > 0 && (
        <Card
          title={'Perfiles encontrados'}
          size={'small'}
          style={{marginBottom: 15}}
          bordered={false}
          extra={
            <PrimaryButton
              icon={<CheckIcon />}
              ghost
              size={'small'}
              onClick={() => {
                setSelectedProfile(profiles[0]);
              }}
              label={'Usar datos'}
            />
          }>
          {loading ? (
            'Buscando...'
          ) : (
            <>
              {profiles[0].name} {profiles[0].last_name} <br />
              <ProfileDocument profile={profiles[0]} />
            </>
          )}
        </Card>
      )}
      <Form form={form} layout={'vertical'} initialValues={selectedProfile} onFinish={createLead}>
        <Form.Item name={'doc_number'} label={'DNI'} rules={[{required: true}]}>
          <Input type="number" autoFocus onChange={e => setSearchProfile(e.target.value)} placeholder={'DNI'} />
        </Form.Item>
        <Form.Item name={'name'} label={'Nombres'}>
          <Input />
        </Form.Item>
        <Form.Item name={'last_name'} label={'Apellidos'}>
          <Input />
        </Form.Item>
        <Form.Item name={'phone'} label={'Teléfono'}>
          <Input />
        </Form.Item>
        <Form.Item name={'email'} label={'E-mail (opcional)'}>
          <Input />
        </Form.Item>
        <Form.Item name={'score'} label={'Puntaje'}>
          <InputNumber />
        </Form.Item>
        <Form.Item name={'observations'} label={'Observaciones'}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item name={'addons'} label={'Información adicional'}>
          <Checkbox.Group>
            <Checkbox value={'Está interesado en comprar'}>Está interesado en comprar</Checkbox>
            <Checkbox value={'Es socio'}>Es socio</Checkbox>
            <Checkbox value={'Tiene familia'}>Tiene familia</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <PrimaryButton loading={saving} label={'Registrar'} htmlType={'submit'} block />
      </Form>
    </div>
  );
};

export default CreateLeadForm;
