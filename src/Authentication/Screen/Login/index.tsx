import React, {useState} from 'react';
import {Button, Divider, Form, Input, Modal} from 'antd';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import {AtSymbolIcon} from '@heroicons/react/24/solid';
import {KeyIcon} from '@heroicons/react/24/outline';
import {ChevronRightIcon} from '@heroicons/react/16/solid';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // configurar Axios para que envie cookies automaticamente
  axios.defaults.withCredentials = true;
  // configura la URL base directamente en el componente Login
  axios.defaults.baseURL = 'http://127.0.0.1:8000';  //Estableciendo la url base para desarrollo

  const login = ({email, password}: any) => {
    axios.defaults.headers.common.Authorization = 'Bearer token';
    console.log(`email:${email}, password: ${password}`);
    const requestConfig: AxiosRequestConfig = {
      url: '/api/v1/authenticate',
      method: 'post',
      data: {
        email,
        password,
      },
    };
    console.log(requestConfig);
    setLoading(true);
    axios(requestConfig)
            .then(({data}) => {
              setLoading(false);
              console.log("TOKEN:", data.token);
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

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // URL completa para desarrollo local
    window.location.href = 'http://localhost:8000/api/v1/authenticate/auth/google/redirect';
  };


  const handleGoogleCallback = async (token: string, profileUuid: string) => {
    try {
      axios.defaults.headers.common.Authorization = 'Bearer ' + token;
      Cookies.set('session_token', token);
      if (profileUuid) {
        Cookies.set('profile_uuid', profileUuid);
      }
      document.location.href = '/';
    } catch (error) {
      console.error('Error processing Google callback:', error);
      Modal.error({
        title: 'Error de autenticación',
        content: 'No se pudo completar el login con Google',
        okText: 'Volver a intentar',
        centered: true,
      });
      setGoogleLoading(false);
    }
  };

  return (
          <>
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

            <Divider>o</Divider>

            {/* Botón de Google Login */}
            <Button
                    type={'default'}
                    shape={'round'}
                    loading={googleLoading}
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

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
