import React, {useState} from 'react';
import {Button, Divider, Form, Input, Modal} from 'antd';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import {LockClosedIcon} from '@heroicons/react/24/solid';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import './styles.less';

//const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY_PUBLIC);

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const login = ({email, password}: any) => {
    axios.defaults.headers.common.Authorization = 'Bearer token';

    const requestConfig: AxiosRequestConfig = {
      url: '/authenticate',
      method: 'post',
      data: {
        email,
        password,
      },
    };
    setLoading(true);
    axios(requestConfig)
      .then(({data}) => {
        setLoading(false);
        axios.defaults.headers.common.Authorization = 'Bearer ' + data.token;
        Cookies.set('session_token', data.token);
        document.location.href = '/';
      })
      .catch(error => {
        setLoading(false);
        if (error.response && error.response.data.error === 'pending_verification') {
          Cookies.set('2fa', error.response.data.hint);
          navigate('/two-factor-verify');
        } else {
          let message = error.message;
          if (error.response) {
            message = error.response.data.message;
          }

          Modal.error({
            title: 'No se pudo iniciar sesión',
            content: message,
            okText: 'Volver a intentar',
            centered: true,
          });
        }
      });
  };

  return (
    <>
      <h2>Iniciar sesión</h2>
      <br />
      <Form onFinish={login}>
        <Form.Item name={'email'}>
          <Input variant={'filled'} placeholder={'E-mail'} inputMode={'email'} />
        </Form.Item>
        <Form.Item name={'password'}>
          <Input.Password variant={'filled'} placeholder={'Contraseña'} />
        </Form.Item>
        <PrimaryButton block icon={<LockClosedIcon />} label={'Ingresar'} loading={loading} htmlType={'submit'} />
      </Form>
      <Divider />
      <NavLink to={'/auth/recover'}>
        <Button block type={'text'}>
          Recuperar contraseña
        </Button>
      </NavLink>
    </>
  );
};

export default Login;
