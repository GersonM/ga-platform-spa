import {useState} from 'react';
import {Form, Input} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface WorkspaceFormProps {
  onComplete?: () => void;
}

const WorkspaceForm = ({onComplete}: WorkspaceFormProps) => {
  const [loading, setLoading] = useState(false);

  const submit = (values: any) => {
    setLoading(true);
    axios
      .post('workspaces', values)
      .then(() => {
        setLoading(false);
        if(onComplete) onComplete();
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };
  return (
    <div>
      <Form layout="vertical" onFinish={submit}>
        <Form.Item label={'ID'} name={'id'}>
          <Input />
        </Form.Item>
        <Form.Item label={'Nombre'} name={'name'}>
          <Input />
        </Form.Item>
        <Form.Item label={'Dominio'} name={'domain'}>
          <Input />
        </Form.Item>
        <PrimaryButton loading={loading} htmlType={'submit'} label={'Crear'} block />
      </Form>
    </div>
  );
};

export default WorkspaceForm;
