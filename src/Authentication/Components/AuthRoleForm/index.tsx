import React from 'react';
import {Form, Input} from 'antd';
import {PlusIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Role} from '../../../Types/api';
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
        onComplete && onComplete();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <Form initialValues={role} layout="vertical" onFinish={submitForm}>
      <Form.Item label={'Nombre'} name={'name'}>
        <Input autoFocus={true} />
      </Form.Item>
      <PrimaryButton htmlType={'submit'} icon={<PlusIcon />} label={'Guardar'} block />
    </Form>
  );
};

export default AuthRoleForm;
