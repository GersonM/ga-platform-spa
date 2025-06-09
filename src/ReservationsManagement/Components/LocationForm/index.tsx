import {useState} from 'react';
import {Form, Input} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {MoveLocation} from '../../../Types/api';

interface CountryFormProps {
  onCompleted: () => void;
  route?: MoveLocation;
}

const LocationForm = ({onCompleted, route}: CountryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const submitForm = (values: Location) => {
    setLoading(true);
    axios
      .request({
        url: route ? `move/locations/${route.uuid}` : 'move/locations',
        method: route ? 'put' : 'post',
        data: values,
      })
      .then(() => {
        setLoading(false);
        if (onCompleted) {
          onCompleted();
          form.resetFields();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <Form name="outerForm" form={form} initialValues={route} layout={'vertical'} onFinish={submitForm}>
        <Form.Item name={'name'} label={'Name'} rules={[{required: true, message: 'El nombre es requerido'}]}>
          <Input />
        </Form.Item>
        <Form.Item
          name={'address'}
          label={'Dirección'}
          rules={[{required: true, message: 'La dirección es requerida'}]}>
          <Input />
        </Form.Item>
        <Form.Item name={'latitude'} label={'Latitude'}>
          <Input />
        </Form.Item>
        <PrimaryButton loading={loading} label={'Guardar'} htmlType={'submit'} />
      </Form>
    </>
  );
};

export default LocationForm;
