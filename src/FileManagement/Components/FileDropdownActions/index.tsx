import React, {useState} from 'react';
import {Dropdown, Modal} from 'antd';
import {TrashIcon} from '@heroicons/react/16/solid';
import axios from 'axios';

import RenameFile from './RenameFile';
import {File} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {PiArrowsOutCardinal, PiPencilSimple} from 'react-icons/pi';

const items = [
  {label: 'Editar', key: 'rename', icon: <PiPencilSimple size={15} />},
  {label: 'Mover a otra ubicación', key: 'move', icon: <PiArrowsOutCardinal size={15} />, disabled: true},
  {type: 'divider', label: '', key: 'divider'},
  {label: 'Borrar', key: 'delete', danger: true, icon: <TrashIcon width={16} />},
];

interface FileDropdownActionsProps {
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  file: File;
  onChange?: () => void;
}

const FileDropdownActions = ({children, trigger, file, onChange}: FileDropdownActionsProps) => {
  const [activeAction, setActiveAction] = useState<string>();

  const onClick = (option: any) => {
    if (option.key === 'delete') {
      Modal.confirm({
        okText: 'Si, borrar',
        content: '¿Seguro que quieres borrar este archivo?',
        onOk: () => deleteFile(),
      });
    } else {
      setActiveAction(option.key);
    }
  };

  const deleteFile = () => {
    axios
      .delete(`file-management/files/${file.uuid}`)
      .then(() => {
        if (onChange) onChange();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const onComplete = () => {
    setActiveAction(undefined);
    if (onChange) onChange();
  };
  const getContent = () => {
    switch (activeAction) {
      case 'move':
        return <RenameFile file={file} onCompleted={onComplete} />;
      case 'rename':
        return <RenameFile file={file} onCompleted={onComplete} />;
    }
  };

  return (
    <>
      <Dropdown menu={{items, onClick}} arrow trigger={trigger}>
        {children}
      </Dropdown>
      <Modal destroyOnClose={true} open={!!activeAction} footer={null} onCancel={() => setActiveAction(undefined)}>
        {getContent()}
      </Modal>
    </>
  );
};

export default FileDropdownActions;
