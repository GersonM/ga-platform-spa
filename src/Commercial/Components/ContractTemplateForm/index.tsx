import {useContext, useState} from 'react';
import {Form, Input} from 'antd';
import {TbCheck} from "react-icons/tb";
import axios from 'axios';

import type {Contract} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface ContractTemplateFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
}

const ContractTemplateForm = ({onComplete, contract}: ContractTemplateFormProps) => {
  const [loading, setLoading] = useState(false);

  const submitForm = (data: any) => {
    setLoading(true);
    axios
      .request({
        url: contract ? `commercial/contracts/${contract.uuid}` : 'commercial/contracts',
        method: contract ? 'PUT' : 'POST',
        data: {...data, is_template: true}
      })
      .then(response => {
        setLoading(false);
        if (onComplete) {
          onComplete(response.data);
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      <h2>Crear plantilla</h2>
      <p>Las plantillas permiten definir los campos necesario para cada tipo de contrato</p>
      <Form layout="vertical" onFinish={submitForm} initialValues={contract}>
        <Form.Item label={'Nombre de la plantilla'} name={'title'}>
          <Input/>
        </Form.Item>
        <Form.Item label={'Descripción (opcional)'} name={'observations'}>
          <Input.TextArea/>
        </Form.Item>
        <PrimaryButton
          icon={<TbCheck/>} loading={loading} block htmlType={'submit'}
          label={'Guardar'}/>
      </Form>
    </div>
  );
};

export default ContractTemplateForm;
