import React from 'react';
import {Checkbox, Col, Form, Input, Row, Select} from "antd";
import type {Contract, ContractItem} from "../../../Types/api.tsx";
import {useForm} from "antd/lib/form/Form";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";

interface ContractItemFormProps {
  contract: Contract;
  contractItem?: ContractItem;
  onComplete?: () => void;
}

const ContractItemForm = ({contract, contractItem, onComplete}: ContractItemFormProps) => {

  const [form] = useForm();

  const submitForm = (values: any) => {
    axios.request({
      url: 'commercial/contract-items' + (contractItem ? '/' + contractItem.uuid : ''),
      method: contractItem ? 'PUT' : 'POST',
      data: {...values, contract_uuid: contract.uuid},
    })
      .then(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <div>
      <Form form={form} layout={'vertical'} onFinish={submitForm} initialValues={contractItem}>
        <Form.Item name={'type'} label={'Tipo'}>
          <Select options={[
            {label: "Texto", value: "text"},
            {label: "Número", value: "number"},
            {label: "Archivo", value: "file"},
          ]}/>
        </Form.Item>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item name={'description'} label={'Nombre'}>
              <Input/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'code'} label={'Código'}>
              <Input/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'value'} label={'Valor'} help={'Puede ser llenado posteriormente'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'group'} label={'Grupo'}>
          <Input/>
        </Form.Item>
        <Form.Item name={'additional_details'} label={'Información adicional (opcional)'}>
          <Input.TextArea/>
        </Form.Item>
        <Form.Item name={'is_required'} valuePropName={'checked'}>
          <Checkbox>Es requerido</Checkbox>
        </Form.Item>
        <PrimaryButton label={'Guardar'} htmlType={'submit'} block/>
      </Form>
    </div>
  );
};

export default ContractItemForm;
