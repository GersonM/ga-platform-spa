import React, {useState} from 'react';
import {Alert, Button, Form, Input, notification} from 'antd';
import PasswordStrengthBar from 'react-password-strength-bar';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import {User} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface UpdateUserPasswordProps {
  onChange?: () => void;
  user: User;
}

const UpdateUserPassword = ({onChange, user}: UpdateUserPasswordProps) => {
  const [password, setPassword] = useState<string>();
  const [generatedPassword, setGeneratedPassword] = useState<string>();
  const [form] = useForm();

  const changePassword = (values: any) => {
    axios
      .post('authentication/change-password', {...values, user_uuid: user.uuid})
      .then(response => {
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
    let result = ' ';
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
        <Button block htmlType={'submit'} type={'primary'}>
          Cambiar contraseña
        </Button>
        {generatedPassword && (
          <Alert
            type={'warning'}
            banner
            message={'Esta es tu nueva contraseña'}
            description={generatedPassword}></Alert>
        )}
        <Button block type={'text'} onClick={generatePassword}>
          Generar contraseña aleatoria
        </Button>
      </Form>
    </div>
  );
};

export default UpdateUserPassword;
