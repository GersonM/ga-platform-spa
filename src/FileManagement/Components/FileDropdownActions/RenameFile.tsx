import React from 'react';
import {Form, Input} from 'antd';
import {CheckIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import {ApiFile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';

interface RenameFileProps {
  file: ApiFile;
  onCompleted?: () => void;
}

const RenameFile = ({file, onCompleted}: RenameFileProps) => {
  const sendForm = (values: any) => {
    axios
      .put(`file-management/files/${file.uuid}`, values)
      .then(() => {
        if (onCompleted) {
          onCompleted();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };
  return (
    <Form layout={'vertical'} onFinish={sendForm} initialValues={file}>
      <h2>Editar archivo</h2>
      <p>
        Al cambiar el nombre o reemplazar el archivos no se modifica la url compartida, se recomienda mantener el
        formato de archivo para evitar problemas
      </p>
      <Form.Item
        name={'name'}
        label={'Nombre'}
        tooltip={'Puedes usar caracteres especiales, tildes, etc. Esto no afectar a la accesibilidad del archivo'}>
        <Input placeholder={'Nombre'} />
      </Form.Item>
      {(file.type.includes('vid') || file.type.includes('aud')) && (
        <Form.Item
          name={'start_from'}
          label={'Inicio de reproducción'}
          tooltip={'Marca el segundo en el que se iniciar la reproducción'}>
          <Input placeholder={'Segundo'} />
        </Form.Item>
      )}
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item label={'Actualizar archivo'}>
        <FileUploader fileUuid={file.uuid} height={180} imagePath={file.thumbnail} showPreview />
      </Form.Item>
      <PrimaryButton icon={<CheckIcon />} label={'Guardar'} htmlType={'submit'} block />
    </Form>
  );
};

export default RenameFile;
