import React, {useState} from 'react';
import {
  TbCancel,
  TbCheck,
  TbClockExclamation,
  TbDeviceFloppy,
  TbInfoSmall,
  TbPencil,
  TbTrash
} from "react-icons/tb";
import {Divider, Input, Popover, Space} from "antd";
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

const ContractItemViewer = ({contractItem, onChange, onEdit, editMode = false}: ContractItemViewerProps) => {
  const [value, setValue] = useState<string>();
  const [isModified, setIsModified] = useState(false);

  const saveValue = () => {
    axios
      .post(`commercial/contract-items/${contractItem.uuid}/value`, {value})
      .then(() => {
        if (onChange) onChange();
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

  const updateValue = (value?: string) => {
    setValue(value);
    setIsModified(true);
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
        <Space split={<Divider type={'vertical'}/>}>
          {editMode ? (<>
            <IconButton icon={<TbPencil/>} onClick={onEdit}/>
            <IconButton icon={<TbTrash/>} danger/>
          </>) : <>
            {contractItem.approved_at ?
              <>
                <div>
                  {contractItem.type == 'file' ?
                    <FilePreview fileUuid={contractItem.value}/> :
                    contractItem.value
                  }
                </div>
                <IconButton icon={<TbCancel/>} danger title={'Quitar aprobación'} onClick={removeApproveItem}/>
              </>
              :
              <>
                {contractItem.type == 'file' && <>
                  <FileUploader small onChange={v => updateValue(v)}/>
                  <FilePreview fileUuid={contractItem.value}/>
                </>}
                {contractItem.type != 'file' &&
                  <Input
                    placeholder={contractItem.description} defaultValue={contractItem.value}
                    onChange={(e) => updateValue(e.target.value)}/>
                }
                <IconButton
                  icon={<TbDeviceFloppy size={22}/>}
                  title={'Guardar'}
                  disabled={!isModified}
                  onClick={saveValue}/>
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
