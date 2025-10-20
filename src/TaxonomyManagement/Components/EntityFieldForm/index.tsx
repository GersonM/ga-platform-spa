import React, {useState} from 'react';
import type {EntityField} from "../../../Types/api.tsx";
import {Form, Input, Select} from "antd";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import {TbCheck} from "react-icons/tb";

interface EntityFieldFormProps {
  entityField?: EntityField;
  onComplete?: () => void;
}

const EntityFieldForm = ({entityField, onComplete}: EntityFieldFormProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>();

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .request({
        url: entityField ? `taxonomy/entity-fields/${entityField.uuid}` : 'taxonomy/entity-fields',
        method: entityField ? 'PUT' : 'POST',
        data: values
      })
      .then(() => {
        setLoading(false);
        if (onComplete) {
          onComplete();
        }
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <Form layout="vertical" initialValues={entityField} onFinish={submitForm}>
      <h3>{entityField ? 'Editar campo' : 'Crear nuevo campo'}</h3>
      <Form.Item label={'Nombre'} name={'name'}>
        <Input/>
      </Form.Item>
      <Form.Item label={'Descripción (opcional)'} name={'description'}>
        <Input.TextArea/>
      </Form.Item>
      <Form.Item label={'Código'} name={'code'}>
        <Input/>
      </Form.Item>
      <Form.Item label={'Grupo'} name={'group'}>
        <Input/>
      </Form.Item>
      <Form.Item label={'Tipo'} name={'type'}>
        <Select
          onChange={value => setType(value)}
          options={[
            {label: 'Texto', value: 'text'},
            {label: 'Número', value: 'number'},
            {label: 'Opciones', value: 'select'},
            {label: 'Si/No', value: 'boolean'},
          ]}/>
      </Form.Item>
      {type == 'select' && (
        <Form.Item label={'Valores'} name={'values'}>
          <Input placeholder={'Eje: Opción 1, Opción 2'}/>
        </Form.Item>
      )}
      <Form.Item label={'Tipo de unidad'} name={'unit_type'}>
        <Input/>
      </Form.Item>
      <PrimaryButton block icon={<TbCheck/>} loading={loading} htmlType={'submit'} label={'Guardar'}/>
    </Form>
  );
};

export default EntityFieldForm;
