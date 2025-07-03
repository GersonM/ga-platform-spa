import {Form, Input} from 'antd';
import {PlusIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import type {Role} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface AuthRoleFormProps {
  role?: Role;
  onComplete?: () => void;
}

const AuthRoleForm = ({role, onComplete}: AuthRoleFormProps) => {
  const submitForm = (values: any) => {
    axios
      .post('authentication/roles', values)
      .then(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <Form initialValues={role} layout="vertical" onFinish={submitForm}>
      <Form.Item label={'Nombre'} name={'name'}>
        <Input autoFocus={true} placeholder={'Eje. Ventas, Administrador, Vigilancia, Jefatura, etc'} />
      </Form.Item>
      <PrimaryButton icon={<PlusIcon />} label={'Guardar'} block htmlType={'submit'} />
    </Form>
  );
};

export default AuthRoleForm;
