import React, {useContext, useState} from 'react';
import {Button, Form, Input, Modal} from 'antd';
import {useNavigate} from 'react-router-dom';
import axios, {AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';

import './styles.less';
import Package from './../../../../package.json';
import logo from './../../../Assets/logo_full.png';
import AuthContext from '../../../Context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {config} = useContext(AuthContext);

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
        if (error.response && error.response.data.error === 'pending_verification') {
          Cookies.set('2fa', error.response.data.hint);
          navigate('/two-factor-verify');
        } else {
          setLoading(false);
          let message = error.message;
          if (error.response) {
            message = error.response.data.message;
          }

          Modal.error({
            title: "Can't verify your credentials",
            content: message,
            okText: 'Try again',
            centered: true,
          });
        }
      });
  };
  return (
    <div className={'login-wrapper'}>
      <div className="login-block zoom-in">
        <div className="page"></div>
        <div className="form-block">
          <img src={config?.logo ? config.logo : logo} alt="Logo" className={'logo'} />
          <Form onFinish={login}>
            <Form.Item name={'email'}>
              <Input bordered={false} className={'login-form-input'} placeholder={'E-mail'} inputMode={'email'} />
            </Form.Item>
            <Form.Item name={'password'}>
              <Input.Password className={'login-form-input'} bordered={false} placeholder={'Contraseña'} />
            </Form.Item>
            <Button
              type={'primary'}
              shape={'round'}
              icon={<span className="button-icon icon-lock"></span>}
              loading={loading}
              htmlType={'submit'}>
              Ingresar
            </Button>
          </Form>
          <span className={'version-info'}>Geek Advice Platform v{Package.version}</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
