import {useState} from 'react';
import {Button, Flex, Form, Input, Steps} from 'antd';
import {CheckIcon} from '@heroicons/react/24/solid';
import {TbArrowLeft, TbArrowRight, TbCheck, TbReload} from "react-icons/tb";
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import webMailImg from '../../Assets/webmail-logo.svg';
import gmailImg from '../../Assets/gmail_Logo.png';
import type {MailProvider} from '../../../Types/api';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import AlertMessage from '../../../CommonUI/AlertMessage';

interface CreateProviderProps {
  onFinish: () => void;
}

const CreateProvider = ({onFinish}: CreateProviderProps) => {
  const [form] = useForm();
  const [providerType, setProviderType] = useState<string>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [newProvider, setNewProvider] = useState<MailProvider>();
  const [syncing, setSyncing] = useState(false);
  const [syncResponse, setSyncResponse] = useState<any>();

  const onSubmitForm = (values: any) => {
    axios
      .post(`inbox-management/providers`, values)
      .then(response => {
        setNewProvider(response.data);
        setCurrentStep(2);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const testNewProvider = () => {
    if (!newProvider) {
      return;
    }
    setSyncing(true);
    axios
      .post(`inbox-management/providers/${newProvider.uuid}/sync`)
      .then(response => {
        setSyncing(false);
        if (response) {
          setSyncResponse(response.data);
        }
      })
      .catch(e => {
        setSyncing(false);
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
          {title: 'Tipo de proveedor',},
          {title: 'Datos de conexión',},
          {title: 'Validación',},
        ]}
      />
      {currentStep === 0 && (
        <div className={'providers-wrapper'}>
          <div
            className="provider-button"
            onClick={() => {
              setProviderType('smtp');
              setCurrentStep(1);
            }}>
            <code>
              SMTP/POP3
            </code>
          </div>
          <div
            className="provider-button"
            onClick={() => {
              setProviderType('webmail');
              setCurrentStep(1);
            }}>
            <img src={webMailImg} alt="Webmail"/>
          </div>
          <div
            className="provider-button"
            onClick={() => {
              setProviderType('gmail');
              setCurrentStep(1);
            }}>
            <img src={gmailImg} alt="Webmail"/>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <>
          <Form form={form} layout={'vertical'} onFinish={onSubmitForm}>
            {providerType === 'smtp' && (
              <>
                <Form.Item name={'name'} label={'Nombre de la cuenta'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'host'} label={'Servidor IMAP'} tooltip={'Incluir el puerto de ser necesario'}>
                  <Input placeholder={'imap.domain.com'}/>
                </Form.Item>
                <Form.Item name={'api_endpoint'} label={'Servidor SMTP (opcional)'}>
                  <Input placeholder={'smtp.domain.com'}/>
                </Form.Item>
              </>
            )}
            {providerType === 'webmail' && (
              <>
                <Form.Item name={'name'} label={'Nombre de la cuenta'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'host'} label={'Dominio'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'username'} label={'Nombre de usuario'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'key'} label={'API Key'}>
                  <Input/>
                </Form.Item>
              </>
            )}
            {providerType === 'gmail' && (
              <>
                <Form.Item name={'name'} label={'Nombre'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'host'} label={'Host'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'username'} label={'App / Usuario'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'key'} label={'Key / Password'}>
                  <Input/>
                </Form.Item>
                <Form.Item name={'api_endpoint'} label={'Endpoint'}>
                  <Input/>
                </Form.Item>
              </>
            )}
            <Flex justify={'space-between'}>
              <Button icon={<TbArrowLeft/>} onClick={() => setCurrentStep(currentStep - 1)}>
                Volver
              </Button>
              <PrimaryButton htmlType={'submit'}>
                Registrar proveedor <TbArrowRight/>
              </PrimaryButton>
            </Flex>
          </Form>
        </>
      )}

      {currentStep === 2 && (
        <div className={'providers-wrapper'}>
          <LoadingIndicator visible={syncing} message={'Verificando conexión'}/>
          <div style={{textAlign: 'center'}}>
            {providerType === 'smtp' ? (
              <>
                <p>El proveedor fue registrado correctamente, ahora puedes agregar cuentas de correo</p>
                <PrimaryButton icon={<TbCheck/>} label={'Terminar'} onClick={onFinish}/>
                <br/>
              </>
            ) : <>
              {!syncResponse && (
                <>
                  <p>El proveedor fue registrado correctamente, haz clic en sincronizar para comprobar la conexión</p>
                  <PrimaryButton icon={<TbReload/>} label={'Sincronizar'} onClick={testNewProvider}/>
                  <br/>
                </>
              )}
              {syncResponse && (
                <>
                  <AlertMessage type={'success'} caption={syncResponse.accounts_created} message={'Cuentas creadas'}/>
                  <PrimaryButton icon={<CheckIcon/>} label={'Terminar'} onClick={onFinish}/>
                  <br/>
                </>
              )}
            </>}
            <br/>
            <Button icon={<TbArrowLeft/>} onClick={() => setCurrentStep(currentStep - 1)}>
              Volver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProvider;
