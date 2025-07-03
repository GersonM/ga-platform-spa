import React, {useState} from 'react';
import {Dropdown, type MenuProps, Modal} from 'antd';
import {PiArrowsOutCardinal, PiFileArchive, PiFileZip, PiPencilSimpleLine, PiTrash} from 'react-icons/pi';
import axios from 'axios';

import RenameFile from './RenameFile';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoveContainer from '../ContainerDropdownActions/MoveContainer';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import type {ApiFile} from "../../../Types/api.tsx";

interface FileDropdownActionsProps {
  children: React.ReactNode;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  file: ApiFile;
  onChange?: () => void;
}

const FileDropdownActions = ({children, trigger, file, onChange}: FileDropdownActionsProps) => {
  const [activeAction, setActiveAction] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const items: MenuProps['items'] = [
    {label: 'Editar', key: 'rename', icon: <PiPencilSimpleLine size={18} />},
    {label: 'Mover a otra ubicación', key: 'move', icon: <PiArrowsOutCardinal size={18} />},
    {type: 'divider'},
    {label: 'Borrar', key: 'delete', danger: true, icon: <PiTrash size={16} />},
  ];

  if (file.name.includes('.zip')) {
    items?.unshift({label: 'Descomprimir aquí', key: 'unpack', icon: <PiFileArchive size={18} />});
  }

  const onClick = (option: any) => {
    switch (option.key) {
      case 'unpack':
        Modal.confirm({
          okText: 'Descomprimir',
          content: '¿Seguro que quieres extraer el contenido de este archivo zip?',
          onOk: () => unpackFile(),
        });
        break;
      case 'delete':
        Modal.confirm({
          okText: 'Si, borrar',
          content: '¿Seguro que quieres borrar este archivo?',
          onOk: () => deleteFile(),
        });
        break;
      default:
        setActiveAction(option.key);
    }
  };

  const deleteFile = () => {
    setLoading(true);
    setLoadingMessage('Borrando...');
    axios
      .delete(`file-management/files/${file.uuid}`)
      .then(() => {
        setLoading(false);
        if (onChange) onChange();
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const unpackFile = () => {
    setLoading(true);
    setLoadingMessage('Descomprimiendo...');
    axios
      .post(`file-management/files/${file.uuid}/unpack`)
      .then(() => {
        setLoading(false);
        if (onChange) onChange();
      })
      .catch(error => {
        setLoading(false);
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
        return <MoveContainer file={file} onCompleted={onComplete} />;
      case 'rename':
        return <RenameFile file={file} onCompleted={onComplete} />;
    }
  };

  return (
    <>
      <Dropdown menu={{items, onClick}} arrow trigger={trigger}>
        <div style={{position: 'relative'}}>
          <LoadingIndicator visible={loading} message={loadingMessage} />
          {children}
        </div>
      </Dropdown>
      <Modal destroyOnHidden open={!!activeAction} footer={null} onCancel={() => setActiveAction(undefined)}>
        {getContent()}
      </Modal>
    </>
  );
};

export default FileDropdownActions;
