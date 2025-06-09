
import {Form, Input} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {PlusIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface CourseModuleFormProps {
  onComplete?: () => void;
  courseUUID: string;
}

const CourseModuleForm = ({onComplete, courseUUID}: CourseModuleFormProps) => {
  const [form] = useForm();

  const submitForm = (values: any) => {
    axios
      .post('/lms/modules', {...values, course_uuid: courseUUID})
      .then(() => {
        onComplete && onComplete();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form form={form} layout="vertical" onFinish={submitForm}>
      <Form.Item name={'name'} label={'Nombre del módulo'}>
        <Input />
      </Form.Item>
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea />
      </Form.Item>
      <PrimaryButton icon={<PlusIcon />} htmlType={'submit'} label={'Nuevo modulo'} block />
    </Form>
  );
};

export default CourseModuleForm;
