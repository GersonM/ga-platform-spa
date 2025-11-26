import {useEffect, useState} from 'react';
import {Checkbox, Col, DatePicker, Form, Input, Row, Select, Space} from 'antd';
import {TbCheck, TbPencil} from "react-icons/tb";
import {useForm} from "antd/lib/form/Form";
import dayjs from "dayjs";
import axios from 'axios';

import type {Contract} from '../../../Types/api';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from "../../../CommonUI/IconButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import PaymentMethodTypesSelector from "../../../CommonUI/PaymentMethodTypesSelector";
import HtmlEditor from "../../../CommonUI/HtmlEditor";

interface CommercialContractFormProps {
  onComplete?: (data: Contract) => void;
  contract?: Contract;
  isTemplate?: boolean;
}

const CommercialContractForm = ({onComplete, contract, isTemplate = false}: CommercialContractFormProps) => {
  const [loading, setLoading] = useState(false);
  const [chooseSeller, setChooseSeller] = useState(false);
  const [period, setPeriod] = useState<string>();
  const [formData, setFormData] = useState<any>();
  const [form] = useForm();

  useEffect(() => {
    if (contract && form) {
      const newFields: any = {...contract};
      newFields.created_at = dayjs(contract.created_at);
      newFields.date_start = newFields.date_start ? dayjs(contract.date_start) : undefined;
      newFields.date_end = newFields.date_end ? dayjs(contract.date_end) : undefined;
      newFields.dead_line = newFields.dead_line ? dayjs(contract.dead_line) : undefined;
      newFields.approved_at = newFields.approved_at ? dayjs(contract.approved_at) : undefined;
      newFields.provided_at = newFields.provided_at ? dayjs(contract.provided_at) : undefined;
      setFormData(newFields);
    }
  }, [contract]);

  useEffect(() => {
    if (formData) {
      form.resetFields();
    }
  }, [formData]);

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
            <Form.Item name={'title'} label={'Nombre del servicio'}>
              <Input placeholder={'Opcional'} />
            </Form.Item>
            <Form.Item label={'Impuestos'}>
              <Form.Item name={'apply_taxes'} noStyle valuePropName={'checked'}>
                <Checkbox>Aplicar impuestos (IGV 18%)</Checkbox>
              </Form.Item>
              <Form.Item name={'include_taxes'} noStyle valuePropName={'checked'}>
                <Checkbox>El monto incluye impuestos</Checkbox>
              </Form.Item>
            </Form.Item>
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
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
            </Form.Item>
            <Form.Item label="Fecha de venta (opcional)" name="approved_at">
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
            </Form.Item>
            <Form.Item label="Fecha de inicio (opcional)" name="date_start">
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
            </Form.Item>
            <Form.Item label="Fecha de entrega - Deadline (opcional)" name="dead_line" help={'Fecha prometida de entrega'}>
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
            </Form.Item>
            <Form.Item label="Fecha de finalización (opcional)" name="date_end">
              <DatePicker style={{width: '100%'}} placeholder={'Hoy'}/>
            </Form.Item>
            <Form.Item label={'Método de pago (opcional)'} name={'payment_type'}>
              <PaymentMethodTypesSelector/>
            </Form.Item>
            <Form.Item label={'Cóndiciones de pago (opcional)'} name={'payment_conditions'}>
              <HtmlEditor />
            </Form.Item>
            <Form.Item label={'Detalles del servicio (opcional)'} name={'service_details'}>
              <HtmlEditor />
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
