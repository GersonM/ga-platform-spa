import {useState} from 'react';
import {Button, Flex, Form, Input, Steps} from 'antd';
import {ArrowLeftIcon, ArrowRightIcon, CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';
import {useForm} from 'antd/lib/form/Form';

import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import webMailImg from '../../Assets/webmail-logo.svg';
import gmailImg from '../../Assets/gmail_Logo.png';
import type {MailProvider} from '../../../Types/api';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import {ArrowPathIcon} from '@heroicons/react/24/outline';
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
          <Form form={form} layout={'vertical'} onFinish={onSubmitForm}>
            {providerType === 'webmail' && (
              <>
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
              </>
            )}
            {providerType === 'gmail' && (
              <>
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
              </>
            )}
            <Flex justify={'space-between'}>
              <Button icon={<ArrowLeftIcon />} onClick={() => setCurrentStep(currentStep - 1)}>
                Volver
              </Button>
              <PrimaryButton htmlType={'submit'}>
                Registrar proveedor <ArrowRightIcon />
              </PrimaryButton>
            </Flex>
          </Form>
        </>
      )}

      {currentStep === 2 && (
        <div className={'providers-wrapper'}>
          <LoadingIndicator visible={syncing} message={'Verificando conexión'} />
          <div style={{textAlign: 'center'}}>
            <p>El proveedor fue registrado correctamente, haz clic en sincronizar para comprobar la conexión</p>
            {!syncResponse && (
              <>
                <PrimaryButton icon={<ArrowPathIcon />} label={'Sincronizar'} onClick={testNewProvider} />
                <br />
              </>
            )}
            {syncResponse && (
              <>
                <AlertMessage type={'success'} caption={syncResponse.accounts_created} message={'Cuentas creadas'} />
                <PrimaryButton icon={<CheckIcon />} label={'Terminar'} onClick={onFinish} />
                <br />
              </>
            )}
            <br />
            <Button icon={<ArrowLeftIcon />} onClick={() => setCurrentStep(currentStep - 1)}>
              Volver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProvider;
