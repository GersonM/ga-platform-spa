import React, {useState} from 'react';
import {Col, Divider, Form, Input, InputNumber, Modal, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveDriver, MoveRoute, Profile} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import SearchProfile from '../../../CommonUI/SearchProfile';
import CreateProfile from '../../../AccountManagement/Components/CreateProfile';
import {PlusIcon} from '@heroicons/react/24/solid';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';

interface CountryFormProps {
  onCompleted: () => void;
  driver?: MoveDriver;
}

const RouteForm = ({onCompleted, driver}: CountryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [form] = useForm();

  const submitForm = (values: MoveRoute) => {
    setLoading(true);
    axios
      .request({
        url: driver ? `move/drivers/${driver.uuid}` : 'move/drivers',
        method: driver ? 'put' : 'post',
        data: values,
      })
      .then(() => {
        setLoading(false);
        if (onCompleted) {
          onCompleted();
          form.resetFields();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <Form form={form} initialValues={driver} requiredMark={false} layout={'vertical'} onFinish={submitForm}>
        <Form.Item
          name={'fk_profile_uuid'}
          label={'Información personal'}
          rules={[{required: true, message: 'Información personal'}]}>
          <ProfileSelector
            onChange={(_uuid, p) => {
              if (p) {
                setProfile(p.entity);
              } else {
                setProfile(undefined);
              }
            }}
          />
        </Form.Item>
        <Divider>Información de conductor</Divider>
        {profile && (
          <div>
            {profile.name} {profile.last_name}
            <br />
            <ProfileDocument profile={profile} />
            <Divider />
          </div>
        )}
        <Form.Item name={'license_type'} label={'Tipo de licencia'}>
          <Select
            showSearch
            options={[
              {label: 'A-I', value: 'AI'},
              {label: 'A-IIa', value: 'AIIa'},
              {label: 'A-IIb', value: 'AIIb'},
              {label: 'A-IIIa', value: 'AIIIa'},
              {label: 'A-IIIb', value: 'AIIIb'},
              {label: 'A-IIIc', value: 'AIIIc'},
              {label: 'B-I', value: 'BI'},
              {label: 'B-IIa', value: 'BIIa'},
              {label: 'B-IIb', value: 'BIIb'},
              {label: 'B-IIc', value: 'BIIc'},
            ]}
          />
        </Form.Item>
        <Form.Item name={'license_number'} label={'Número de licencia'}>
          <Input />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default RouteForm;
