import {useContext, useState} from 'react';
import {Button, Divider, Form, Input, Modal} from 'antd';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {type AxiosRequestConfig} from 'axios';
import {TbAt, TbChevronRight, TbKey} from 'react-icons/tb';
import {GoogleLogin} from "@react-oauth/google";
import Cookies from 'js-cookie';

import AuthContext from "../../../Context/AuthContext.tsx";
import MetaTitle from "../../../CommonUI/MetaTitle";
import AlertMessage from "../../../CommonUI/AlertMessage";
import tenantAppConfig from "../../../Context/TenantAppConfig.tsx";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {darkMode} = useContext(AuthContext);

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

  const handleGoogleLogin = (credentialResponse: any) => {
    axios.post('authenticate/service/google', {token: credentialResponse.credential})
      .then(({data}) => {
        axios.defaults.headers.common.Authorization = 'Bearer ' + data.token;
        Cookies.set('session_token', data.token);
        document.location.href = '/';
      })
      .catch(error => {
        if (error.response && error.response.data.error === 'pending_verification') {
          Cookies.set('2fa', error.response.data.hint);
          navigate('/two-factor-verify');
        } else {
          let message = error.message;
          if (error.response) {
            message = error.response.data.error;
          }

          Modal.error({
            title: 'No se pudo iniciar sesión',
            content: message,
            okText: 'Volver a intentar',
            centered: true,
          });
        }
      })
  };

  return (
    <>
      <MetaTitle title="Login"/>
      <Form onFinish={login}>
        <h2>Bienvenid@ de vuelta</h2>
        <div className={'input-large'}>
          <div className="icon">
            <TbAt size={20}/>
          </div>
          <Form.Item name={'email'} noStyle>
            <Input variant={'borderless'} placeholder={'E-mail'} inputMode={'email'}/>
          </Form.Item>
        </div>
        <div className={'input-large'}>
          <div className="icon">
            <TbKey size={18}/>
          </div>
          <Form.Item name={'password'} noStyle>
            <Input.Password variant={'borderless'} placeholder={'Contraseña'}/>
          </Form.Item>
        </div>
        <Button block type={'primary'} shape={'round'} loading={loading} htmlType={'submit'}>
          Ingresar <TbChevronRight/>
        </Button>
      </Form>
      <br/>
      <NavLink to={'/auth/recover'}>
        <Button block type={'link'} color="default">
          Recuperar contraseña
        </Button>
      </NavLink>
      {axios.defaults.headers.common['X-Tenant'] == 'demo' &&
        <AlertMessage message={'Credenciales de prueba'}>
          <b>E-mail:</b> admin@test.com <br/>
          <b>Contraseña:</b> admin@test.com
        </AlertMessage>
      }
      <Divider/>
      <GoogleLogin
        theme={darkMode ? 'filled_black' : 'filled_blue'}
        onSuccess={handleGoogleLogin}
      />
      <br/>
      <a href="https://geekadvice.pe/politica-privacidad/">
        Política de privacidad
      </a>
    </>
  );
};

export default Login;
