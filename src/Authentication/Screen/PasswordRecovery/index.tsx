import React, {useState} from 'react';
import {Button, Divider, Form, Input} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {LockClosedIcon} from '@heroicons/react/24/solid';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import ErrorHandler from '../../../Utils/ErrorHandler';

const PasswordRecovery = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const recover = ({email}: any) => {
    axios.defaults.headers.common.Authorization = 'Bearer token';

    const requestConfig: AxiosRequestConfig = {
      url: '/authenticate/recovery',
      method: 'post',
      data: {email},
    };
    setLoading(true);
    axios(requestConfig)
      .then(({data}) => {
        setLoading(false);
        Cookies.set('recovery_token', data.token);
        navigate('/auth/verify-recovery');
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <h2>Recuperar mi contraseña</h2>
      <p>Ingresa el correo con el que inicias sesión</p>
      <br />
      <Form onFinish={recover}>
        <Form.Item name={'email'}>
          <Input variant={'filled'} placeholder={'E-mail'} inputMode={'email'} />
        </Form.Item>
        <PrimaryButton block icon={<LockClosedIcon />} label={'Ingresar'} loading={loading} htmlType={'submit'} />
      </Form>
      <Divider />
      <NavLink to={'/auth/login'}>
        <Button block type={'text'}>
          Iniciar sesión
        </Button>
      </NavLink>
    </>
  );
};

export default PasswordRecovery;
