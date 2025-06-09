import {useState} from 'react';
import {Button, Divider, Form} from 'antd';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/24/solid';
import {NavLink} from 'react-router-dom';
import axios, {type AxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import OtpInput from 'react-otp-input';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';

const VerifyRecovery = () => {
  const [loading, setLoading] = useState(false);

  const recover = ({otp}: any) => {
    axios.defaults.headers.common.Authorization = 'Bearer token';

    const token = Cookies.get('recovery_token');

    const requestConfig: AxiosRequestConfig = {
      url: '/authenticate/recovery/verification',
      method: 'post',
      data: {otp, token},
    };
    setLoading(true);
    axios(requestConfig)
      .then(({data}) => {
        setLoading(false);
        Cookies.remove('recovery_token');
        Cookies.set('session_token', data.token);
        axios.defaults.headers.common.Authorization = 'Bearer ' + data.token;
        document.location.href = '/accounts';
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <h2>Verifica tu código</h2>
      <p>Ingresa el OTP que enviamos a tu correo registrado</p>
      <br />
      <Form onFinish={recover}>
        <Form.Item name={'otp'}>
          {/* @ts-ignore */}
          <OtpInput
            shouldAutoFocus
            placeholder={'------'}
            containerStyle={'otp-input'}
            numInputs={6}
            renderInput={props => <input {...props} />}
          />
        </Form.Item>
        <PrimaryButton block icon={<ArrowRightIcon />} label={'Enviar'} loading={loading} htmlType={'submit'} />
      </Form>
      <Divider />
      <NavLink to={'/auth/login'}>
        <Button block type={'text'} icon={<ArrowLeftIcon width={10} />}>
          Volver al login
        </Button>
      </NavLink>
    </>
  );
};

export default VerifyRecovery;
