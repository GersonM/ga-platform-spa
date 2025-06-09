import {useState} from 'react';
import {Button, Divider, Form, Input} from 'antd';
import {AtSymbolIcon} from '@heroicons/react/24/solid';
import {NavLink, useNavigate} from 'react-router-dom';
import axios, {AxiosRequestConfig} from 'axios';
import {ChevronRightIcon} from '@heroicons/react/16/solid';
import Cookies from 'js-cookie';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {TbChevronLeft, TbChevronRight} from 'react-icons/tb';

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
        <div className={'input-large'}>
          <div className="icon">
            <AtSymbolIcon width={17} />
          </div>
          <Form.Item name={'email'} noStyle rules={[{required: true}]}>
            <Input size={'large'} variant={'borderless'} placeholder={'E-mail'} inputMode={'email'} />
          </Form.Item>
        </div>
        <Button shape={'round'} block loading={loading} htmlType={'submit'} type="primary">
          Enviar <TbChevronRight />
        </Button>
      </Form>
      <Divider />
      <NavLink to={'/auth/login'}>
        <Button block type={'text'}>
          <TbChevronLeft /> Volver a iniciar sesión
        </Button>
      </NavLink>
    </>
  );
};

export default PasswordRecovery;
