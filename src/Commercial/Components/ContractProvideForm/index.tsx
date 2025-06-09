import {useState} from 'react';
import {DatePicker, Form, Input} from 'antd';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {Contract} from '../../../Types/api';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

interface ContractProvideFormProps {
  contract?: Contract;
  onComplete?: () => void;
}

const ContractProvideForm = ({contract, onComplete}: ContractProvideFormProps) => {
  const [loading, setLoading] = useState(false);

  const provide = (values: any) => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/provide`, values)
      .then(() => {
        setLoading(false);
        onComplete && onComplete();
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <>
      <LoadingIndicator visible={loading} message={'Registrando entrega'} />
      <Form onFinish={provide}>
        <p>Si la fecha de entrega se deja en blanco se registrará con la fecha de hoy.</p>
        <Form.Item name={'date'}>
          <DatePicker placeholder={'Hoy'} />
        </Form.Item>
        <Form.Item name={'observations'}>
          <Input.TextArea placeholder={'Observaciones (opcional)'} />
        </Form.Item>
        <PrimaryButton htmlType={'submit'} loading={loading} icon={<CheckIcon />} block label={'Registrar'} />
      </Form>
    </>
  );
};

export default ContractProvideForm;
