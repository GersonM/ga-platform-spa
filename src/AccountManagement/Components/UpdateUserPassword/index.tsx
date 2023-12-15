import React, {useState} from 'react';
import {Button, Form, Input, notification} from 'antd';
import PasswordStrengthBar from 'react-password-strength-bar';

import {User} from '../../../Types/api';
import users from '../../Screens/Users';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface UpdateUserPasswordProps {
  onChange?: () => void;
  user: User;
}

const UpdateUserPassword = ({onChange, user}: UpdateUserPasswordProps) => {
  const [password, setPassword] = useState<string>();

  const changePassword = (values: any) => {
    console.log(values);
    axios
      .post('authentication/change-password', {...values, user_uuid: user.uuid})
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

  return (
    <div>
      <Form layout={'vertical'} onFinish={changePassword}>
        <Form.Item name={'password'} label={'Nueva contraseña'}>
          <Input.Password onChange={value => setPassword(value.currentTarget.value)} />
        </Form.Item>
        <PasswordStrengthBar password={password} />
        <Form.Item name={'retype-password'} label={'Nueva contraseña'}>
          <Input.Password />
        </Form.Item>
        <Button block htmlType={'submit'} type={'primary'}>
          Cambiar contraseña
        </Button>
      </Form>
    </div>
  );
};

export default UpdateUserPassword;
