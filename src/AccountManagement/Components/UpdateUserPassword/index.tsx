import React, {useState} from 'react';
import {Alert, Button, Form, Input, notification} from 'antd';
import PasswordStrengthBar from 'react-password-strength-bar';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import {Profile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import AlertMessage from '../../../CommonUI/AlertMessage';

interface UpdateUserPasswordProps {
  onChange?: () => void;
  profile: Profile;
}

const UpdateUserPassword = ({onChange, profile}: UpdateUserPasswordProps) => {
  const [password, setPassword] = useState<string>();
  const [generatedPassword, setGeneratedPassword] = useState<string>();
  const [form] = useForm();

  const changePassword = (values: any) => {
    console.log(values);
    axios
      .post('authentication/change-password', {...values, user_uuid: profile.user?.uuid, profile_uuid: profile.uuid})
      .then(response => {
        console.log(response);
        if (onChange) {
          onChange();
          notification.success({message: 'Tu contraseña se actualizo correctamente'});
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const generateString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  };

  const generatePassword = () => {
    const passString = generateString(12);
    form.setFieldValue('password', passString);
    form.setFieldValue('retype-password', passString);
    setGeneratedPassword(passString);
  };

  return (
    <div>
      {!profile.user && (
        <p>
          Esta persona no tiene un usuario asociado, al generar una contraseña se creará el usuario y este podrá acceder
          a la plataforma
        </p>
      )}
      <Form form={form} layout={'vertical'} onFinish={changePassword}>
        <Form.Item name={'password'} label={'Nueva contraseña'}>
          <Input.Password
            onChange={value => {
              if (generatedPassword) {
                setGeneratedPassword(undefined);
                form.setFieldValue('retype-password', undefined);
              }
              setPassword(value.currentTarget.value);
            }}
          />
        </Form.Item>
        <PasswordStrengthBar password={password} />
        <Form.Item name={'retype-password'} label={'Nueva contraseña'}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button block htmlType={'submit'} type={'primary'}>
            Cambiar contraseña
          </Button>
        </Form.Item>
        {generatedPassword && (
          <Alert
            type={'warning'}
            banner
            message={'Esta es tu nueva contraseña'}
            description={generatedPassword}></Alert>
        )}
        {profile.login_method === 'imap' && (
          <AlertMessage
            caption={'Este usuario tienen configurado el inicio de sesión con webmail'}
            message={'Se actualizará la contraseña de Webmail'}
          />
        )}
        <Button block type={'text'} onClick={generatePassword}>
          Generar contraseña aleatoria
        </Button>
      </Form>
    </div>
  );
};

export default UpdateUserPassword;
