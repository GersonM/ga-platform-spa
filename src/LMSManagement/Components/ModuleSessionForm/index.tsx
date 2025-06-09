
import {Form, Input} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {PlusIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FileUploader from '../../../FileManagement/Components/FileUploader';

interface CourseModuleFormProps {
  onComplete?: () => void;
  moduleUUID: string;
}

const ModuleSessionForm = ({onComplete, moduleUUID}: CourseModuleFormProps) => {
  const [form] = useForm();

  const submitForm = (values: any) => {
    axios
      .post('/lms/sessions', {...values, module_uuid: moduleUUID})
      .then(() => {
        onComplete && onComplete();
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <Form form={form} layout="vertical" onFinish={submitForm}>
      <Form.Item name={'title'} label={'Nombre de la sesión'}>
        <Input />
      </Form.Item>
      <Form.Item name={'fk_file_uuid'} label={'Videos'}>
        <FileUploader />
      </Form.Item>
      <PrimaryButton icon={<PlusIcon />} htmlType={'submit'} label={'Nuevo modulo'} block />
    </Form>
  );
};

export default ModuleSessionForm;
