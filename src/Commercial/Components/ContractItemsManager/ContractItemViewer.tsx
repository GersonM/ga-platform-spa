import React, {useState} from 'react';
import {
  TbCancel,
  TbCheck,
  TbClockExclamation,
  TbDeviceFloppy,
  TbInfoSmall,
  TbPencil,
  TbTrash, TbTrashX
} from "react-icons/tb";
import {Divider, Input, InputNumber, Popconfirm, Popover, Space, Switch} from "antd";
import axios from "axios";
import dayjs from "dayjs";

import type {ContractItem} from "../../../Types/api.tsx";
import IconButton from "../../../CommonUI/IconButton";
import FileUploader from "../../../FileManagement/Components/FileUploader";
import FilePreview from "../../../CommonUI/FilePreview";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface ContractItemViewerProps {
  contractItem: ContractItem;
  onChange?: () => void;
  onEdit?: () => void;
  editMode?: boolean;
}

const itemTypes: any = {boolean: 'Checkbox', file: 'Archivo', text: 'Texto', number: 'Número'};

const ContractItemViewer = ({contractItem, onChange, onEdit, editMode = false}: ContractItemViewerProps) => {
  const [value, setValue] = useState<string | undefined>(contractItem.value);
  const [isModified, setIsModified] = useState(false);

  const saveValue = () => {
    axios
      .post(`commercial/contract-items/${contractItem.uuid}/value`, {value})
      .then(() => {
        if (onChange) onChange();
        setIsModified(false);
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }

  const destroyItem = () => {
    axios
      .delete(`commercial/contract-items/${contractItem.uuid}`)
      .then(() => {
        if (onChange) onChange();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }

  const removeValue = () => {
    axios
      .post(`commercial/contract-items/${contractItem.uuid}/value`, {value: null})
      .then(() => {
        if (onChange) onChange();
        setIsModified(false);
        setValue(undefined);
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }

  const approveItem = () => {
    axios
      .post(`commercial/contract-items/${contractItem.uuid}/approve`)
      .then(() => {
        if (onChange) onChange();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }

  const removeApproveItem = () => {
    axios
      .post(`commercial/contract-items/${contractItem.uuid}/remove-approve`)
      .then(() => {
        if (onChange) onChange();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  }

  const getValueViewer = (type: string) => {
    switch (type) {
      case 'boolean':
        return <Switch
          checkedChildren={'Si'}
          unCheckedChildren={'No'}
          defaultValue={contractItem.value == '1'}
          disabled
        />;
      case 'file':
        return <FilePreview fileUuid={contractItem.value}/>;
      default:
        return contractItem.value;
    }
  }

  const getValueInput = (type: string) => {
    switch (type) {
      case 'file':
        return <>
          <FileUploader showPreview small onChange={v => updateValue(v)}/>
          {contractItem.value && <FilePreview fileUuid={contractItem.value}/>}
        </>;
      case 'boolean':
        return <Switch
          checkedChildren={'Si'}
          unCheckedChildren={'No'}
          defaultValue={contractItem.value == '1'}
          onChange={value => updateValue(value ? '1' : '0')}/>;
      case 'number':
        return <InputNumber
          placeholder={contractItem.description} value={value}
          onChange={(e) => updateValue(e?.toString())}
        />
      default:
        return <Input
          placeholder={contractItem.description} value={value}
          onChange={(e) => updateValue(e.target.value)}
        />
    }
  }

  const updateValue = (value?: string) => {
    setValue(value);
    setIsModified(true);
    console.log(value);
  };

  return (
    <div className={'contract-item-container'}>
      {
        contractItem.is_required ?
          (contractItem.approved_at ?
            <Popover content={<div>
              Aprobado por {contractItem.approved_by?.name} <br/>
              <small>{dayjs(contractItem.approved_at).fromNow()}</small>
            </div>}>
              <TbCheck size={27} color={'green'}/>
            </Popover>
            :
            <TbClockExclamation size={27} color={contractItem.value ? undefined : 'orange'}/>) :
          <TbInfoSmall size={27}/>
      }
      <div className={'label-container'}>
        {contractItem.description}
        <small>{contractItem.additional_details}</small>
      </div>
      <div>
        <Space separator={<Divider orientation={'vertical'}/>}>
          {editMode ? (<>
            {itemTypes[contractItem.type]}
            <IconButton icon={<TbPencil/>} onClick={onEdit}/>
            <Popconfirm
              onConfirm={destroyItem} title={'¿Quieres eliminar este item?'}
              description={'Los valores almacenados también se eliminarán y no se pueden recuperar'}>
              <IconButton icon={<TbTrash/>} danger/>
            </Popconfirm>
          </>) : <>
            {contractItem.approved_at ?
              <>
                {getValueViewer(contractItem.type)}
                <IconButton icon={<TbCancel/>} danger title={'Quitar aprobación'} onClick={removeApproveItem}/>
              </>
              :
              <>
                {getValueInput(contractItem.type)}
                {(contractItem.value && !isModified) ?
                  <IconButton
                    danger
                    icon={<TbTrashX size={22}/>}
                    title={'Borrar valor'}
                    onClick={removeValue}/> :
                  <IconButton
                    icon={<TbDeviceFloppy size={22}/>}
                    title={'Guardar'}
                    disabled={!isModified}
                    onClick={saveValue}/>
                }
                <IconButton
                  icon={<TbCheck color={contractItem.value ? 'green' : undefined}/>}
                  title={'Aprobar'}
                  disabled={!contractItem.value}
                  onClick={approveItem}/>
              </>
            }
          </>}
        </Space>
      </div>
    </div>
  );
};

export default ContractItemViewer;
