import React from 'react';
import {Button, Form, Input} from 'antd';
import {File} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface RenameFileProps {
  file: File;
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
      <h3>Cambiar nombre de archivo</h3>
      <Form.Item
        name={'name'}
        label={'Nombre'}
        tooltip={'Puedes usar caracteres especiales, tildes, etc. Esto no afectar a la accesibilidad del archivo'}>
        <Input placeholder={'Nombre'} />
      </Form.Item>
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea />
      </Form.Item>
      <Button type={'primary'} htmlType={'submit'}>
        Guardar
      </Button>
    </Form>
  );
};

export default RenameFile;
