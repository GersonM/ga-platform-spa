import React from 'react';
import {Form, Input} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface ICourseFormProps {
  onComplete?: () => void;
}

const CourseForm = ({onComplete}: ICourseFormProps) => {
  const submitForm = (values: any) => {
    axios
      .post('/lms/courses', values)
      .then(response => {
        onComplete && onComplete();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <Form layout="vertical" onFinish={submitForm}>
      <Form.Item name={'name'} label={'Nombre del curso'}>
        <Input />
      </Form.Item>
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name={'category'} label={'Categoría y etiquetas'} help={'Usa valores separados por comas'}>
        <Input />
      </Form.Item>
      <PrimaryButton htmlType={'submit'} label={'Guardar'} block />
    </Form>
  );
};

export default CourseForm;
