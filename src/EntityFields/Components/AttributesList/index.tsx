import React from 'react';
import {Tooltip} from "antd";
import pluralize from "pluralize";
import type {EntityFieldValue} from "../../../Types/api.tsx";
import useAttributeIcon from "../../../WarehouseManager/Hooks/useAttributeIcon.tsx";
import './styles.less';

interface AttributesListProps {
  attributes?: EntityFieldValue[];
}

const AttributesList = ({attributes}:AttributesListProps) => {
  const {getIcon} = useAttributeIcon();

  return (
    <div className={'attributes-list-wrapper'}>
      {attributes?.length == 0 && <small>No hay atributos adicionales</small>}
      {attributes?.map((attribute, index) => {
        return <Tooltip title={attribute.field.name} key={index}>
          <span className={'attribute-item'}>
            {getIcon(attribute.field.code)}
            {(attribute.field.type == 'number' && attribute.field.unit_type != 'm2' && attribute.field.unit_type != 'm' && attribute.field.unit_type != 'S/') ?
              <>{pluralize(attribute.field.unit_type, parseInt(attribute.value), true)}</> :
              <>{attribute.value} {attribute.field.unit_type}</>}
          </span>
        </Tooltip>;
      })}
    </div>
  );
};

export default AttributesList;
