import {useState} from 'react';
import {Button, Divider, Form, Input, Modal} from 'antd';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {type AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import {TbAt, TbChevronRight, TbKey} from 'react-icons/tb';
import GoogleButton from './GoogleButton';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [_googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = axios.defaults.baseURL + 'authenticate/auth/google/redirect';
    //window.location.href = 'http://localhost:8000/api/v1/authenticate/auth/google/redirect';
  };

  // Función para manejar el callback de Google (si necesitas procesarlo en el frontend)
  /*const handleGoogleCallback = async (token: string, profileUuid: string) => {
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
  };*/

  return (
    <>
      <Form onFinish={login}>
        <div className={'input-large'}>
          <div className="icon">
            <TbAt size={20} />
          </div>
          <Form.Item name={'email'} noStyle>
            <Input variant={'borderless'} placeholder={'E-mail'} inputMode={'email'} />
          </Form.Item>
        </div>
        <div className={'input-large'}>
          <div className="icon">
            <TbKey size={18} />
          </div>
          <Form.Item name={'password'} noStyle>
            <Input.Password variant={'borderless'} placeholder={'Contraseña'} />
          </Form.Item>
        </div>
        <Button type={'primary'} shape={'round'} loading={loading} htmlType={'submit'}>
          Ingresar <TbChevronRight />
        </Button>
      </Form>
      <Divider>o</Divider>
      <GoogleButton onClick={handleGoogleLogin} />
      <Divider />
      <NavLink to={'/auth/recover'}>
        <Button block variant="filled" color="default">
          Recuperar contraseña
        </Button>
      </NavLink>
    </>
  );
};

export default Login;
