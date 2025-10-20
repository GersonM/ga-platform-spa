import React, {useEffect, useState} from 'react';
import {Button} from "antd";
import {PlusOutlined} from "@ant-design/icons";

import type {EntityFieldValue} from "../../../Types/api.tsx";
import EntityFieldValueForm from "../EntityFieldValueForm";
import './styles.less';

interface EntityFieldsEditorProps {
  value?: EntityFieldValue[];
  entity: any;
  showHint?: boolean;
  onChange?: (entity: EntityFieldValue[]) => void;
  onComplete?: () => void;
}

const EntityFieldsEditor = ({value = [], onChange, onComplete, showHint = false}: EntityFieldsEditorProps) => {
  const [metadata, setMetadata] = useState<EntityFieldValue[] | any[]>(value);

  useEffect(() => {
    if (onChange) onChange(metadata);
  }, [metadata]);

  const addField = () => {
    const newMetadata = [...metadata];
    newMetadata.push({uuid: metadata.length + Math.random().toString(36).slice(2, 8) + ''});
    setMetadata(newMetadata);
  }

  return (
    <div>
      {metadata?.map((fieldValue, index) => (
        <EntityFieldValueForm
          key={fieldValue.uuid}
          fieldValue={fieldValue}
          onRemove={() => {
            const newMetadata = [...metadata];
            newMetadata.splice(index, 1);
            setMetadata(newMetadata);
            if (onComplete) onComplete();
          }}
          onComplete={onComplete}
          onChange={(value) => {
            const newMetadata = [...metadata];
            newMetadata[index] = value;
            setMetadata(newMetadata);
          }}
        />
      ))}
      <Button
        type="dashed"
        block
        onClick={addField}
        icon={<PlusOutlined/>}
      >
        Agregar atributo
      </Button>
      {showHint && (
        <small style={{display: 'block', lineHeight: '1.4', marginTop: 10}}>
          <strong>Agrega información adicional específica de este stock.</strong>
          <br/>
          Campos sugeridos: ubicación, lote, proveedor ref, test realizado, condition, vencimiento proximo.
        </small>
      )}
    </div>
  );
};

export default EntityFieldsEditor;
