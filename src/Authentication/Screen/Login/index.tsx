import React, {useState} from 'react';
import {Button, Divider, Form, Input, Modal} from 'antd';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import {AtSymbolIcon} from '@heroicons/react/24/solid';

import {KeyIcon} from '@heroicons/react/24/outline';
import {ChevronRightIcon} from '@heroicons/react/16/solid';

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
      <br />
      <br />
      <Form onFinish={login}>
        <div className={'input-large'}>
          <div className="icon">
            <AtSymbolIcon width={17} />
          </div>
          <Form.Item name={'email'} noStyle>
            <Input size={'large'} variant={'borderless'} placeholder={'E-mail'} inputMode={'email'} />
          </Form.Item>
        </div>
        <div className={'input-large'}>
          <div className="icon">
            <KeyIcon width={17} />
          </div>
          <Form.Item name={'password'} noStyle>
            <Input.Password size={'large'} variant={'borderless'} placeholder={'Contraseña'} />
          </Form.Item>
        </div>
        <Button type={'primary'} shape={'round'} loading={loading} htmlType={'submit'}>
          Ingresar <ChevronRightIcon style={{marginTop: 1}} />
        </Button>
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
