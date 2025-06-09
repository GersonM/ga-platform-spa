import {useState} from 'react';
import {Form, Input} from 'antd';
import axios from 'axios';

import type {TaxonomyDefinition, ApiFile} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';
import {CheckIcon} from '@heroicons/react/24/solid';

interface TaxonomyFormProps {
  entity?: TaxonomyDefinition;
  parentUuid?: string;
  onComplete?: (entity: TaxonomyDefinition) => void;
}

const TaxonomyForm = ({entity, onComplete, parentUuid}: TaxonomyFormProps) => {
  const [uploadedFile, setUploadedFile] = useState<ApiFile>();
  const onSubmit = (values: any) => {
    axios
      .request({
        url: `taxonomy/definitions${entity ? '/' + entity.uuid : ''}`,
        method: entity ? 'PUT' : 'POST',
        data: {...values, parent_uuid: parentUuid, cover_uuid: uploadedFile?.uuid},
      })
      .then(res => {
        onComplete && onComplete(res.data);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  console.log(entity?.cover?.thumbnail);

  return (
    <Form onFinish={onSubmit} layout="vertical" initialValues={entity}>
      <Form.Item name={'name'} label={'Nombre'} rules={[{required: true}]}>
        <Input />
      </Form.Item>
      <Form.Item name={'code'} label={'Code'} rules={[{required: true}]}>
        <Input />
      </Form.Item>
      <Form.Item name={'description'} label={'Descripción'}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item label={'Portada'}>
        <FileUploader
          showPreview
          imagePath={entity?.cover?.thumbnail}
          onFilesUploaded={file => {
            setUploadedFile(file);
            console.log(file);
          }}
        />
      </Form.Item>
      <PrimaryButton block icon={<CheckIcon />} htmlType={'submit'} label={'Guardar'} />
    </Form>
  );
};

export default TaxonomyForm;
