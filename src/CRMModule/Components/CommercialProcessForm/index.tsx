import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Col, Form, Input, InputNumber, Row} from "antd";
import {TbPlus, TbTrash} from "react-icons/tb";
import axios from "axios";

import PrimaryButton from "../../../CommonUI/PrimaryButton";
import type {CommercialProcess} from "../../../Types/api.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface CommercialProcessFormProps {
  process?: CommercialProcess;
  onComplete?: () => void;
}

type CommercialProcessFormValues = {
  name: string;
  description?: string;
  parent_uuid?: string;
  stages?: Array<{
    uuid?: string;
    order?: number;
    name?: string;
    description?: string;
  }>;
};

const CommercialProcessForm = ({process, onComplete}: CommercialProcessFormProps) => {
  const [form] = Form.useForm<CommercialProcessFormValues>();
  const [saving, setSaving] = useState(false);

  const initialValues = useMemo<Partial<CommercialProcessFormValues>>(() => {
    const source: any = process;
    return {
      name: source.name,
      description: source.description,
      parent_uuid: source.parent_uuid ?? source.fk_parent_uuid ?? source.parent?.uuid,
      stages: process?.stages.map((stage: any) => ({
        uuid: stage.uuid,
        order: stage.order,
        name: stage.name,
        description: stage.description,
      })),
    };
  }, [process]);

  useEffect(() => {
    form.setFieldsValue({
      name: initialValues.name,
      description: initialValues.description,
      parent_uuid: initialValues.parent_uuid,
      stages: initialValues.stages?.length ? initialValues.stages : [{order: 1, name: '', description: ''}],
    });
  }, [form, initialValues]);

  const submitForm = (values: CommercialProcessFormValues) => {
    setSaving(true);

    const payload = {
      ...values,
      parent_uuid: values.parent_uuid || null,
      stages: (values.stages || [])
        .filter(stage => (stage?.name || '').trim().length > 0)
        .map((stage, index) => ({
          uuid: stage.uuid,
          order: stage.order || index + 1,
          name: stage.name?.trim(),
          description: stage.description,
        })),
    };

    axios
      .request({
        url: process ? `commercial/processes/${process.uuid}` : "commercial/processes",
        method: process ? "PUT" : "POST",
        data: payload,
      })
      .then(() => {
        if (!process) {
          form.resetFields();
        }
        if (onComplete) {
          onComplete();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div>
      <h2>{process ? 'Editar' : 'Crear'} proceso</h2>
      <Form
        form={form}
        layout={'vertical'}
        onFinish={submitForm}
        initialValues={initialValues}
      >
        <Row gutter={20}>
          <Col xs={24} md={10}>
            <Form.Item name={'name'} label={'Nombre del proceso'} rules={[{required: true}]}>
              <Input/>
            </Form.Item>
            <Form.Item name={'description'} label={'Descripción'}>
              <Input.TextArea/>
            </Form.Item>
          </Col>
          <Col xs={24} md={14}>
            <h3>Etapas del proceso</h3>
            <Form.List name={'stages'}>
              {(fields, {add, remove}) => (
                <>
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size={'small'}
                      title={`Etapa ${index + 1}`}
                      style={{marginBottom: 12}}
                      extra={
                        fields.length > 1 ? (
                          <Button
                            type={'text'}
                            danger
                            icon={<TbTrash size={16}/>}
                            onClick={() => remove(field.name)}
                          />
                        ) : undefined
                      }
                    >
                      <Form.Item name={[field.name, 'uuid']} hidden>
                        <Input/>
                      </Form.Item>
                      <Row gutter={12}>
                        <Col md={19}>
                          <Form.Item
                            name={[field.name, 'name']}
                            label={'Nombre de etapa'}
                            rules={[{required: true, message: 'Ingresa un nombre de etapa'}]}
                          >
                            <Input placeholder={'Ej: Nuevo lead'}/>
                          </Form.Item>
                        </Col>
                        <Col md={5}>
                          <Form.Item
                            name={[field.name, 'order']}
                            label={'Orden'}
                            rules={[{required: true, message: 'Ingresa el orden'}]}
                          >
                            <InputNumber min={1} style={{width: '100%'}}/>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name={[field.name, 'description']} label={'Descripción (opcional)'} style={{marginBottom: 0}}>
                        <Input.TextArea rows={2}/>
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    block
                    type={'dashed'}
                    style={{marginBottom: 15}}
                    icon={<TbPlus size={16}/>}
                    onClick={() => add({order: fields.length + 1, name: '', description: ''})}
                  >
                    Agregar etapa
                  </Button>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
        <PrimaryButton
          icon={<TbPlus/>}
          label={process ? 'Guardar cambios' : 'Agregar proceso'}
          loading={saving}
          block
          htmlType={'submit'}
        />
      </Form>
    </div>
  );
};

export default CommercialProcessForm;
