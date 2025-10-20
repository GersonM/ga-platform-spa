import React, {useEffect, useState} from 'react';
import {Checkbox, Col, Form, Input, InputNumber, Popconfirm, Row} from "antd";
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
  const [selectedFieldValue, setSelectedFieldValue] = useState<EntityFieldValue | undefined>(fieldValue);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (onChange) onChange(selectedFieldValue);
  }, [selectedFieldValue])

  const removeField = () => {
    if (fieldValue?.uuid && fieldValue.uuid?.length > 10) {
      axios.delete(`/taxonomy/entity-fields/values/${fieldValue?.uuid}`)
        .then(() => {
          if (onRemove) onRemove();
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
      case 'boolean':
        return <Checkbox checked={selectedFieldValue.value == '1'} onChange={(e: any) => {
          saveValue('value', e.target.checked ? 1 : 0);
        }}/>;
      case 'number':
        return <InputNumber
          style={{width: '100%'}}
          value={selectedFieldValue?.value}
          placeholder={'Valor'}
          onChange={(v: any) => {
            saveValue('value', v);
          }}
          suffix={selectedFieldValue?.field?.unit_type}
        />
      default:
        return <Input
          value={selectedFieldValue?.value}
          placeholder={'Valor'}
          onChange={(e: any) => saveValue('value', e.target.value)}
          suffix={selectedFieldValue?.field?.unit_type}
        />
    }
  }

  const saveValue = (field: string, value: any) => {
    const newFV: any = {...selectedFieldValue};
    newFV[field] = value;
    setSelectedFieldValue(newFV);
  }

  return (
    <div className={'entity-fields-editor-row'}>
      <Row gutter={[10, 10]}>
        <Col span={11}>
          {(selectedFieldValue?.field && !editFieldMode) ? <>
              <a href="#" onClick={() => setEditFieldMode(!editFieldMode)}>
                {selectedFieldValue.field.name}
              </a>
              <small>{selectedFieldValue.field.description || selectedFieldValue.field.code}</small>
            </> :
            <EntityFieldSelector
              value={selectedFieldValue?.field?.uuid}
              onChange={(value, option) => {
                setEditFieldMode(false);
                saveValue('field', option.entity)
              }}
              onClear={() => setEditFieldMode(!editFieldMode)}/>
          }
        </Col>
        <Col span={10}>
          {getField()}
        </Col>
        <Col span={3}>
          <Popconfirm title={'¿Quieres eliminar este campo?'} onConfirm={removeField}>
            <IconButton
              small
              danger
              loading={deleting}
              icon={<TbTrash/>}
            />
          </Popconfirm>
        </Col>
      </Row>
    </div>
  );
};

export default EntityFieldValueForm;
