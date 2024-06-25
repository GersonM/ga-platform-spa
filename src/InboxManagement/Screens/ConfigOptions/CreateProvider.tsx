import React, {useState} from 'react';
import {Button, Form, Input, Select, Space, Steps} from 'antd';
import axios from 'axios';
import {useForm} from 'antd/lib/form/Form';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import webMailImg from '../../Assets/webmail-logo.svg';
import gmailImg from '../../Assets/gmail_Logo.png';

interface CreateProviderProps {
  onFinish: () => void;
}

const CreateProvider = ({onFinish}: CreateProviderProps) => {
  const [form] = useForm();
  const [providerType, setProviderType] = useState<string>();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const onSubmitForm = (values: any) => {
    axios
      .post(`inbox-management/providers`, values)
      .then(response => {
        if (onFinish) {
          onFinish();
        }
        form.resetFields();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div>
      <Steps
        size="small"
        style={{margin: '20px 0'}}
        current={currentStep}
        items={[
          {
            title: 'Tipo de proveedor',
          },
          {
            title: 'Datos de conexión',
          },
          {
            title: 'Validación',
          },
        ]}
      />
      {currentStep === 0 && (
        <div className={'providers-wrapper'}>
          <div
            className="provider-button"
            onClick={() => {
              setProviderType('webmail');
              setCurrentStep(1);
            }}>
            <img src={webMailImg} alt="Webmail" />
          </div>
          <div
            className="provider-button"
            onClick={() => {
              setProviderType('gmail');
              setCurrentStep(1);
            }}>
            <img src={gmailImg} alt="Webmail" />
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <>
          {providerType === 'webmail' && (
            <Form form={form} layout={'vertical'} onFinish={onSubmitForm}>
              <Form.Item name={'name'} label={'Nombre'}>
                <Input />
              </Form.Item>
              <Form.Item name={'host'} label={'Dominio'}>
                <Input />
              </Form.Item>
              <Form.Item name={'username'} label={'Usuario'}>
                <Input />
              </Form.Item>
              <Form.Item name={'key'} label={'Key'}>
                <Input />
              </Form.Item>
              <PrimaryButton block label={'Registrar proveedor'} htmlType={'submit'} />
            </Form>
          )}
          {providerType === 'gmail' && (
            <Form form={form} layout={'vertical'} onFinish={onSubmitForm}>
              <Form.Item name={'name'} label={'Nombre'}>
                <Input />
              </Form.Item>
              <Form.Item name={'host'} label={'Host'}>
                <Input />
              </Form.Item>
              <Form.Item name={'username'} label={'App / Usuario'}>
                <Input />
              </Form.Item>
              <Form.Item name={'key'} label={'Key / Password'}>
                <Input />
              </Form.Item>
              <Form.Item name={'api_endpoint'} label={'Endpoint'}>
                <Input />
              </Form.Item>
              <PrimaryButton block label={'Registrar proveedor'} htmlType={'submit'} />
            </Form>
          )}
          <Button onClick={() => setCurrentStep(currentStep - 1)}>Volver</Button>
        </>
      )}
    </div>
  );
};

export default CreateProvider;
