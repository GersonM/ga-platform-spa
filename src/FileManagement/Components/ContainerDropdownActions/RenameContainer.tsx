
import {Form, Input} from 'antd';
import axios from 'axios';

import type {Container} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from "../../../CommonUI/PrimaryButton";

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
      <h3>Editar nombre</h3>
      <p>Puedes usar caracteres especiales, tildes, etc. Esto no afectar a la accesibilidad del archivo</p>
      <Form.Item
        name={'name'}
        label={'Nombre'}>
        <Input placeholder={'Nombre'} />
      </Form.Item>
      <PrimaryButton block htmlType={'submit'}>Guardar</PrimaryButton>
    </Form>
  );
};

export default RenameContainer;
