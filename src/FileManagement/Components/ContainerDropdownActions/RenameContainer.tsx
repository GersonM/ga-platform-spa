
import {Button, Form, Input} from 'antd';
import axios from 'axios';

import type {Container} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface RenameFileProps {
  container: Container;
  onCompleted?: () => void;
}

const RenameContainer = ({container, onCompleted}: RenameFileProps) => {
  const sendForm = (values: any) => {
    axios
      .put(`file-management/containers/${container.uuid}`, values)
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
    <Form layout={'vertical'} onFinish={sendForm} initialValues={{name: container.name}}>
      <h3>Cambiar nombre</h3>
      <Form.Item
        name={'name'}
        label={'Nombre'}
        tooltip={'Puedes usar caracteres especiales, tildes, etc. Esto no afectar a la accesibilidad del archivo'}>
        <Input placeholder={'Nombre'} />
      </Form.Item>
      <Button htmlType={'submit'}>Guardar</Button>
    </Form>
  );
};

export default RenameContainer;
