import React, {useState} from 'react';
import {Col, Form, Input, InputNumber, Popconfirm, Row} from "antd";
import {TbTrash} from "react-icons/tb";
import axios from "axios";

import type {EntityFieldValue} from "../../../Types/api.tsx";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import EntityFieldSelector from "../EntityFieldSelector";

interface EntityFieldValueFormProps {
  fieldValue?: EntityFieldValue;
  onComplete?: () => void;
  onRemove?: () => void;
  onChange?: (values: any) => void;
}

const EntityFieldValueForm = ({fieldValue, onComplete, onChange, onRemove}: EntityFieldValueFormProps) => {
  const [editFieldMode, setEditFieldMode] = useState(false);
  const [wasChanged, setWasChanged] = useState(false);
  const [selectedFieldValue, setSelectedFieldValue] = useState<EntityFieldValue | undefined>(fieldValue);

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
    if (fieldValue?.uuid && fieldValue.uuid?.length > 4) {
      axios.delete(`/taxonomy/entity-fields/values/${fieldValue?.uuid}`)
        .then(() => {
          if (onComplete) onComplete();
        })
        .catch(err => {
          ErrorHandler.showNotification(err);
        })
    } else {
      if (onRemove) onRemove();
    }
  }

  const getField = () => {
    switch (selectedFieldValue?.field?.type) {
      case 'number':
        return <InputNumber
          placeholder={'Valor'}
          suffix={selectedFieldValue?.field?.unit_type}
        />
      default:
        return <Input
          placeholder={'Valor'}
          suffix={selectedFieldValue?.field?.unit_type}
        />
    }
  }

  return (
    <Form
      initialValues={fieldValue}
      onValuesChange={(values, all) => {
        if (onChange) onChange({...fieldValue, ...all, field: selectedFieldValue?.field});
      }}
      onFinish={submitForm}
    >
      <Row gutter={[10, 10]}>
        <Col span={10}>
          {(selectedFieldValue?.field && !editFieldMode) ? <>
              <a href="#" onClick={() => setEditFieldMode(!editFieldMode)}>
                {selectedFieldValue.field.name}
              </a>
              <small>{selectedFieldValue.field.description || selectedFieldValue.field.code}</small>
            </> :
            <Form.Item name={'fk_entity_field_uuid'}>
              <EntityFieldSelector
                onChange={(value, option) => {
                  setEditFieldMode(false);
                  const newFV: any = {...selectedFieldValue};
                  newFV.field = option.entity;
                  setSelectedFieldValue(newFV);
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
