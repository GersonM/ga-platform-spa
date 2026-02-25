import React, {useEffect, useState} from 'react';
import {Button, Input, InputNumber, Popconfirm, Space, Switch} from "antd";
import {TbMapPin, TbTrash} from "react-icons/tb";
import axios from "axios";

import type {EntityFieldValue} from "../../../Types/api.tsx";
import IconButton from "../../../CommonUI/IconButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import EntityFieldSelector from "../EntityFieldSelector";
import ProfileSelector from "../../../CommonUI/ProfileSelector";

interface EntityFieldValueFormProps {
  fieldValue?: EntityFieldValue;
  onComplete?: () => void;
  onRemove?: () => void;
  onChange?: (values: any) => void;
}

const EntityFieldValueForm = ({fieldValue, onChange, onRemove}: EntityFieldValueFormProps) => {
  const [editFieldMode, setEditFieldMode] = useState(false);
  const [selectedFieldValue, setSelectedFieldValue] = useState<EntityFieldValue | undefined>(fieldValue);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (onChange) onChange(selectedFieldValue);
  }, [selectedFieldValue])

  const removeField = () => {
    setDeleting(true);
    if (fieldValue?.uuid && fieldValue.uuid?.length > 10) {
      axios.delete(`/taxonomy/entity-fields/values/${fieldValue?.uuid}`)
        .then(() => {
          setDeleting(false);
          if (onRemove) onRemove();
        })
        .catch(err => {
          setDeleting(false);
          ErrorHandler.showNotification(err);
        })
    } else {
      if (onRemove) onRemove();
    }
  }

  const getField = () => {
    switch (selectedFieldValue?.field?.type) {
      case 'boolean':
        return <Switch checked={selectedFieldValue.value == '1'} onChange={(e) => {
          saveValue('value', e ? 1 : 0);
        }}/>
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
      case 'profile':
        return <ProfileSelector
          size={"small"}
          value={selectedFieldValue?.value}
          placeholder={'Valor'}
          onChange={(v: any) => {
            saveValue('value', v);
          }}/>;
      case 'geolocation':
        return <Space.Compact>
          <Button icon={<TbMapPin/>}/>
          <Input
          value={selectedFieldValue?.value}
          placeholder={'Lat,Lon'}
          onChange={(e: any) => saveValue('value', e.target.value)}
          suffix={selectedFieldValue?.field?.unit_type}
        />
        </Space.Compact>;
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
      <div className={'name'}>
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
      </div>
      <div className={'field'}>
        {getField()}
      </div>
      <div className={'tools'}>
        <Popconfirm title={'¿Quieres eliminar este campo?'} onConfirm={removeField}>
          <IconButton
            small
            danger
            loading={deleting}
            icon={<TbTrash/>}
          />
        </Popconfirm>
      </div>
    </div>
  );
};

export default EntityFieldValueForm;
