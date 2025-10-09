import React, {useEffect, useState} from 'react';
import type {EntityFieldValue} from "../../../Types/api.tsx";
import {Button} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import EntityFieldValueForm from "../EntityFieldValueForm";

interface EntityFieldsEditorProps {
  fieldValues: EntityFieldValue[];
  entity: any;
  onChange?: (entity: EntityFieldValue[]) => void;
  onComplete?: () => void;
}

const EntityFieldsEditor = ({entity, fieldValues, onChange, onComplete}: EntityFieldsEditorProps) => {
  const [metadata, setMetadata] = useState<EntityFieldValue[] | any[]>(fieldValues);

  useEffect(() => {
    if (onChange) onChange(metadata);
  }, [metadata]);

  const addField = () => {
    const newMetadata = [...metadata];
    newMetadata.push({uuid: metadata.length + ''});
    setMetadata(newMetadata);
  }

  return (
    <div>
      {metadata?.map((fieldValue, index) => (
        <EntityFieldValueForm
          key={index}
          fieldValue={fieldValue}
          onRemove={() => {
            const newMetadata = [...metadata];
            setMetadata(newMetadata.splice(index, 1));
          }}
          onChange={(key, value) => {
            const newMetadata = [...metadata];
            newMetadata[index][key] = value;
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
        Agregar campo
      </Button>
    </div>
  );
};

export default EntityFieldsEditor;
