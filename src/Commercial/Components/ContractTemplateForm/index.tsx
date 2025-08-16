import {useContext, useEffect, useState} from 'react';
import {Form, Input} from 'antd';
import {TbCheck} from "react-icons/tb";
import axios from 'axios';

import type {Contract, StorageStock} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface ContractTemplateFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
  isTemplate?: boolean;
}

const ContractTemplateForm = ({onComplete, contract, isTemplate = false}: ContractTemplateFormProps) => {
  const {user} = useContext(AuthContext);
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState<'company' | 'profile'>()
  const [selectedStockUUID, setSelectedStockUUID] = useState<string>();
  const [chooseSeller, setChooseSeller] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [approveOrder, setApproveOrder] = useState(false);

  useEffect(() => {
    if (!selectedStockUUID) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`warehouses/stock/${selectedStockUUID}`, config)
      .then(response => {
        if (response) {
          setSelectedStock(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [selectedStockUUID]);

  const submitForm = (data: any) => {
    setLoading(true);
    axios
      .request({
        url: contract ? `commercial/contracts/${contract.uuid}` : 'commercial/contracts',
        method: contract ? 'PUT' : 'POST',
        data: {...data, is_template: isTemplate}
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
      <h2>{isTemplate ? 'Crear plantilla' : (approveOrder ? 'Nueva venta' : 'Nueva cotización')}</h2>
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
          label={isTemplate ? 'Guardar' : 'Registrar contrato'}/>
      </Form>
    </div>
  );
};

export default ContractTemplateForm;
