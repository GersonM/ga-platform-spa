
import {Checkbox, Form, Input} from 'antd';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import type {Contract} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface CancelContractsProps {
  contract: Contract;
  onComplete?: () => void;
}

const CancelContract = ({contract, onComplete}: CancelContractsProps) => {
  const onSubmit = (values: any) => {
    axios
      .delete('commercial/contracts/' + contract.uuid, {params: values})
      .then(() => {
        onComplete && onComplete();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };
  return (
    <div>
      <h2>Anular contrato</h2>
      <p>Al anular el contrato este queda en estado anulado, las facturas relacionadas se </p>
      <Form onFinish={onSubmit} layout="vertical">
        <Form.Item label={'Motivo'} name={'reason'}>
          <Input />
        </Form.Item>
        <Form.Item name={'reason'}>
          <Checkbox>Iniciar proceso de desistimiento</Checkbox>
        </Form.Item>
        <PrimaryButton htmlType={'submit'} danger label={'Proceder con la anulación'} block />
      </Form>
    </div>
  );
};

export default CancelContract;
