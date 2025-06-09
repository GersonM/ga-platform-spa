import {useState} from 'react';
import {Button, Form, Input} from 'antd';
import axios from 'axios';
import type {MailAccount} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface MailSetupFormProps {
  mailAccount: MailAccount;
  onChange?: () => void;
}

const MailSetupForm = ({mailAccount, onChange}: MailSetupFormProps) => {
  const [loading, setLoading] = useState(false);
  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .put(`inbox-management/accounts/${mailAccount?.uuid}`, values)
      .then(response => {
        setLoading(false);
        if (response && onChange) {
          onChange();
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };
  return (
    <div>
      <Form layout={'vertical'} onFinish={submitForm}>
        <Form.Item name={'contact_name'} label={'Nombre de contacto'}>
          <Input defaultValue={mailAccount.contact_name} placeholder={'Nombre del usuario'} />
        </Form.Item>
        <Form.Item name={'password'} label={'Contraseña'}>
          <Input.Password placeholder={'Sin cambios'} />
        </Form.Item>
        <Button loading={loading} htmlType={'submit'} type={'primary'}>
          Guardar
        </Button>
      </Form>
    </div>
  );
};

export default MailSetupForm;
