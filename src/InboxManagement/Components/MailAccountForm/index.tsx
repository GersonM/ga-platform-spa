import React, {useState} from 'react';
import {useForm} from "antd/lib/form/Form";
import {Form, Input} from "antd";
import type {MailAccount, MailProvider} from "../../../Types/api.tsx";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ProfileSelector from "../../../CommonUI/ProfileSelector";

interface MailAccountFormProps {
  mailProvider: MailProvider;
  mailAccount?: MailAccount;
  onComplete?: () => void;
}

const MailAccountForm = ({mailAccount, mailProvider, onComplete}: MailAccountFormProps) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  const submitForm = (values: any) => {
    setLoading(true);
    axios.request({
      url: '/inbox-management/accounts' + (mailAccount ? ('/' + mailAccount?.uuid) : ''),
      method: mailAccount ? 'PUT' : 'POST',
      data: {...values, mail_provider_uuid: mailProvider.uuid},
    })
      .then((response) => {
        setLoading(false);
        if (response.status === 200) {
          if (onComplete) onComplete();
        }
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  }

  return (
    <div>
      <Form initialValues={mailAccount} layout={'vertical'} onFinish={submitForm}>
        <Form.Item label="Propietario de la cuenta" name="profile_uuid">
          <ProfileSelector/>
        </Form.Item>
        <Form.Item label="Email" name="address">
          <Input/>
        </Form.Item>
        <Form.Item label="Contraseña" name="password">
          <Input.Password/>
        </Form.Item>
        <Form.Item label="Nombre de contacto" name="contact_name">
          <Input/>
        </Form.Item>
        <PrimaryButton htmlType="submit" disabled={loading} label={'Guardar'} block/>
      </Form>
    </div>
  );
};

export default MailAccountForm;
