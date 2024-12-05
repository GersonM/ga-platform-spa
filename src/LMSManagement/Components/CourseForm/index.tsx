import React from 'react';
import {Checkbox, Form, Input} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ProfileSelector from '../../../CommonUI/ProfileSelector';
import SelectLarge from '../../../CommonUI/SelectLarge';

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
      <Form.Item name={'category'} label={'Categoría y etiquetas'} extra={'Usa valores separados por comas'}>
        <Input />
      </Form.Item>
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name={'benefits'} label={'Beneficios'}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name={'is_public'} label={'Estado de publicación'}>
        <Checkbox>Publicar</Checkbox>
      </Form.Item>
      <Form.Item name={'taxonomy_uuid'} label={'Categoría'}>
        <SelectLarge value={'aasdfasdf'} items={['Value 1', 'Value 2', 'Value 3']} />
        <Form.Item name={'profile_uuid'} label={'Profesor'}>
          <ProfileSelector />
        </Form.Item>
      </Form.Item>
      <PrimaryButton htmlType={'submit'} label={'Guardar'} block />
    </Form>
  );
};

export default CourseForm;
