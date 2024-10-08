import React from 'react';
import {Form, Input} from 'antd';
import {PlusIcon} from '@heroicons/react/24/solid';
import {useForm} from 'antd/lib/form/Form';

import PrimaryButton from '../../../CommonUI/PrimaryButton';

const CourseModule = () => {
  const [form] = useForm();

  const submitForm = () => {};

  return (
    <Form form={form} layout="vertical" onFinish={submitForm}>
      <Form.Item label={'Nombre del módulo'}>
        <Input />
      </Form.Item>
      <PrimaryButton icon={<PlusIcon />} label={'Nuevo modulo'} block />
    </Form>
  );
};

export default CourseModule;
