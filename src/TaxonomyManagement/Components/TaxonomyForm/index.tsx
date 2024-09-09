import React, {useState} from 'react';
import {Form, Input} from 'antd';
import axios from 'axios';

import {TaxonomyDefinition, File} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileUploader from '../../../CommonUI/FileUploader';

interface TaxonomyFormProps {
  entity?: TaxonomyDefinition;
  parentUuid?: string;
  onComplete?: (entity: TaxonomyDefinition) => void;
}

const TaxonomyForm = ({entity, onComplete, parentUuid}: TaxonomyFormProps) => {
  const [uploadedFile, setUploadedFile] = useState<File>();
  const onSubmit = (values: any) => {
    axios
      .request({
        url: `taxonomy/definitions/${entity ? entity.uuid : ''}`,
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
      <FileUploader
        onFilesUploaded={file => {
          setUploadedFile(file);
          console.log(file);
        }}
      />
      <PrimaryButton htmlType={'submit'} label={'Guardar'} />
    </Form>
  );
};

export default TaxonomyForm;
