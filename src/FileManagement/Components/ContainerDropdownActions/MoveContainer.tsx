import React, {useState} from 'react';
import {Form} from 'antd';
import axios from 'axios';

import {ApiFile, Container} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContainerSelector from '../../../CommonUI/ContainerSelector';
import {PiArrowRight} from 'react-icons/pi';

interface RenameFileProps {
  container?: Container;
  file?: ApiFile;
  onCompleted?: () => void;
}

const MoveContainer = ({file, container, onCompleted}: RenameFileProps) => {
  const [loading, setLoading] = useState(false);

  const sendForm = (values: any) => {
    setLoading(true);
    axios
      .post(`file-management/move-to-container`, {...values, file_uuid: file?.uuid, container_uuid: container?.uuid})
      .then(() => {
        setLoading(false);
        if (onCompleted) {
          onCompleted();
        }
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <Form layout={'vertical'} onFinish={sendForm}>
      <h2>
        Mover carpeta: <strong>{container?.name}</strong>
        <strong>{file?.name}</strong>
      </h2>
      <Form.Item name={'target_container'} label={'Carpeta de destino'} rules={[{required: true}]}>
        <ContainerSelector />
      </Form.Item>
      <PrimaryButton block htmlType={'submit'} loading={loading} label={'Mover'} icon={<PiArrowRight size={17} />} />
    </Form>
  );
};

export default MoveContainer;
