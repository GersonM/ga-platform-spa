import React, {useState} from 'react';
import {Col, Form, Input, InputNumber, Popconfirm, Row} from "antd";
import {TbTrash} from "react-icons/tb";
import axios from "axios";

import type {EntityField, EntityFieldValue} from "../../../Types/api.tsx";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import EntityFieldSelector from "../EntityFieldSelector";

interface EntityFieldValueFormProps {
  fieldValue?: EntityFieldValue;
  onComplete?: () => void;
  onRemove?: () => void;
  onChange?: (key: string, values: any) => void;
}

const EntityFieldValueForm = ({fieldValue, onComplete, onChange, onRemove}: EntityFieldValueFormProps) => {
  const [editFieldMode, setEditFieldMode] = useState(false);
  const [wasChanged, setWasChanged] = useState(false);
  const [selectedField, setSelectedField] = useState<EntityField | undefined>(fieldValue?.field);

  const submitForm = (values: any) => {
    axios.request({
      method: fieldValue ? 'PUT' : 'POST',
      url: fieldValue ? `/taxonomy/entity-fields/values/${fieldValue.uuid}` : '/taxonomy/entity-fields/values',
    })
      .then(() => {
        if (onComplete) onComplete();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }

  const removeField = () => {
    console.log(fieldValue?.uuid?.length);
    if (fieldValue?.uuid && fieldValue.uuid?.length > 4) {
      axios.delete(`/api/entity/${fieldValue?.uuid}`, {})
        .then(() => {
          if (onComplete) onComplete();
        })
        .catch(err => {
          ErrorHandler.showNotification(err);
        })
    } else {
      console.log(fieldValue)
      if (onRemove) onRemove();
    }
  }

  const getField = () => {
    switch (selectedField?.type) {
      case 'number':
        return <InputNumber
          placeholder={'Valor'}
          onChange={(value) => {
            if (onChange) onChange('value', value);
          }}
          suffix={selectedField?.unit_type}
        />
      default:
        return <Input
          placeholder={'Valor'}
          onChange={(value) => {
            if (onChange) onChange('value', value.target.value);
          }}
          suffix={selectedField?.unit_type}
        />
    }
  }

  return (
    <Form
      initialValues={fieldValue}
      onValuesChange={(values, all) => {
        console.log('changes', all);
      }}
      onFinish={submitForm}
    >
      <Row gutter={[10, 10]}>
        <Col span={10}>
          {(fieldValue?.field && !editFieldMode) ? <>
              <a href="#" onClick={() => setEditFieldMode(!editFieldMode)}>
                {fieldValue.field.name}
              </a>
              <small>{fieldValue.field.description || fieldValue.field.code}</small>
            </> :
            <Form.Item name={'fk_entity_field_uuid'}>
              <EntityFieldSelector
                onChange={(value, option) => {
                  console.log(value, option.entity);
                  if (onChange) onChange('entity_field_uuid', option.entity);
                  setEditFieldMode(false);
                  setSelectedField(option.entity);
                }}
                onClear={() => setEditFieldMode(!editFieldMode)}/>
            </Form.Item>}
        </Col>
        <Col span={10}>
          <Form.Item name={'value'}>
            {getField()}
          </Form.Item>
        </Col>
        <Col span={2}>
          <Popconfirm title={'¿Quieres eliminar este campo?'} onConfirm={removeField}>
            <IconButton
              small
              danger
              icon={<TbTrash/>}
            />
          </Popconfirm>
        </Col>
      </Row>
    </Form>
  );
};

export default EntityFieldValueForm;
