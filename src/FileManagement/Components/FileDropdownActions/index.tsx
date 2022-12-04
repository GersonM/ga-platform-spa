import React, {useState} from 'react';
import {Dropdown, Modal} from 'antd';
import RenameFile from './RenameFile';
import {File} from '../../../Types/api';

const items = [
  {label: 'Mover archivo', key: 'move', icon: <span className={'icon icon-move'} />},
  {label: 'Cambiar nombre', key: 'rename', icon: <span className={'icon icon-pencil-line'} />},
  {label: 'Actualizar', key: 'update', icon: <span className={'icon icon-repeat'} />},
  {type: 'divider', label: '', key: 'divider'},
  {label: 'Borrar', key: 'delete', danger: true, icon: <span className={'icon icon-trash'} />},
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
    console.log(option);
    setActiveAction(option.key);
  };

  const onComplete = () => {
    setActiveAction(undefined);
    if (onChange) onChange();
  };
  const getContent = () => {
    switch (activeAction) {
      case 'delete':
        return <RenameFile file={file} onCompleted={onComplete} />;
      case 'move':
        return <RenameFile file={file} onCompleted={onComplete} />;
      case 'rename':
        return <RenameFile file={file} onCompleted={onComplete} />;
    }
  };

  return (
    <>
      <Modal destroyOnClose={true} open={!!activeAction} footer={null} onCancel={() => setActiveAction(undefined)}>
        {getContent()}
      </Modal>
      <Dropdown menu={{items, onClick}} arrow trigger={trigger}>
        {children}
      </Dropdown>
    </>
  );
};

export default FileDropdownActions;
