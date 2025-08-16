import {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, Row, Select, Space} from 'antd';
import {TbCheck, TbPencil} from "react-icons/tb";
import {useForm} from "antd/lib/form/Form";
import dayjs from "dayjs";
import axios from 'axios';

import type {Contract, StorageStock} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyInput from "../../../CommonUI/MoneyInput";
import IconButton from "../../../CommonUI/IconButton";
import CurrencySelector from "../../../PaymentManagement/Components/CurrencySelector";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";

interface CommercialContractFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
  isTemplate?: boolean;
}

const CommercialContractForm = ({onComplete, contract, isTemplate = false}: CommercialContractFormProps) => {
  const [selectedStock, setSelectedStock] = useState<StorageStock>();
  const [loading, setLoading] = useState(false);
  const [selectedStockUUID, setSelectedStockUUID] = useState<string>();
  const [chooseSeller, setChooseSeller] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [formData, setFormData] = useState<any>();
  const [form] = useForm();

  useEffect(() => {
    if (contract && form) {
      const newFields: any = {...contract};
      newFields.created_at = dayjs(contract.created_at);
      newFields.approved_at = newFields.approved_at ? dayjs(contract.created_at) : null;
      newFields.provided_at = newFields.provided_at ? dayjs(contract.provided_at) : null;
      setFormData(newFields);
    }
  }, [contract]);

  useEffect(() => {
    if (formData) {
      form.resetFields();
    }
  }, [formData]);

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
      <Form form={form} layout="vertical" onFinish={submitForm} initialValues={formData}>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <Form.Item label={'Duración'} name={'period'}>
              <Select
                showSearch
                allowClear
                onChange={value => setPeriod(value)}
                placeholder={'Único'}
                options={[
                  {value: 'unique', label: 'Único'},
                  {value: 'monthly', label: 'Mensual'},
                  {value: 'annual', label: 'Anual'},
                ]}
              />
            </Form.Item>
            <Row gutter={[15, 15]}>
              <Col xs={10}>
                <Form.Item label={'Moneda'} name={'currency'}>
                  <CurrencySelector
                    placeholder={contract?.contractable?.currency}
                    onChange={(value: string) => setSelectedCurrency(value)}/>
                </Form.Item>
              </Col>
              <Col xs={14}>
                <Form.Item label={'Precio de venta'} name={'amount'}>
                  <MoneyInput
                    currency={contract?.contractable?.currency}
                    placeholder={contract?.amount ? contract.amount + '' : contract?.contractable?.currency}/>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={'Observaciones (opcional)'} name={'observations'}>
              <Input.TextArea/>
            </Form.Item>
            {!isTemplate && (
              <Form.Item label={'Vendedor'} name={'fk_created_by_uuid'}>
                {chooseSeller ? (
                    <ProfileSelector/>
                  ) :
                  <Space>
                    <ProfileChip profile={contract?.created_by}/>
                    <IconButton
                      icon={<TbPencil/>}
                      onClick={() => setChooseSeller(!chooseSeller)}
                    />
                  </Space>
                }
              </Form.Item>
            )}
          </Col>
          <Col span={12}>
            <Row gutter={[20, 20]}>
              <Col span={15}>
                {(period && period != 'unique') &&
                  <Form.Item label={' '} name={'is_renewable'} valuePropName={'checked'}>
                    <Checkbox>Renovar automáticamente</Checkbox>
                  </Form.Item>
                }
              </Col>
            </Row>
            <Form.Item label="Fecha de propuesta (opcional)" name="created_at">
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'} format={'DD/MM/YYYY'}/>
            </Form.Item>
            <Form.Item label="Fecha de venta (opcional)" name="approved_at">
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'} format={'DD/MM/YYYY'}/>
            </Form.Item>
            <Form.Item label={'Método de pago (opcional)'} name={'payment_type'}>
              <PaymentMethodTypesSelector />
            </Form.Item>
            <Form.Item label={'Cóndiciones de pago (opcional)'} name={'payment_conditions'}>
              <Input.TextArea/>
            </Form.Item>
            <Form.Item label={'Detalles del servicio (opcional)'} name={'service_details'}>
              <Input.TextArea/>
            </Form.Item>
          </Col>
        </Row>
        <PrimaryButton
          icon={<TbCheck/>} loading={loading} block htmlType={'submit'}
          label={'Guardar cambios'}/>
      </Form>
    </div>
  );
};

export default CommercialContractForm;
