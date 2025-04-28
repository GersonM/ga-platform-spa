import React, {useEffect, useState} from 'react';
import {Button, Card, Cascader, Form, Input} from 'antd';
import axios from 'axios';

import {Container} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ContainerNavItem from '../../Screens/CompanyContainers/ContainerNavItem';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import Panel from 'antd/es/splitter/Panel';
import ContainerSelector from '../../../CommonUI/ContainerSelector';

interface RenameFileProps {
  container: Container;
  onCompleted?: () => void;
}

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

const MoveContainer = ({container, onCompleted}: RenameFileProps) => {
  const [containers, setContainers] = useState<Container[]>();
  const [loading, setLoading] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`file-management/containers`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          if (response.status === 204) {
            setContainers([]);
          }
          setContainers(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`file-management/containers/${selectedContainer?.uuid}/view`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setSelectedContainer(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  const sendForm = (values: any) => {
    axios
      .put(`file-management/containers/${container.uuid}`, values)
      .then(() => {
        if (onCompleted) {
          onCompleted();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <Form layout={'vertical'} onFinish={sendForm} initialValues={{name: container.name}}>
      <h2>Mover carpeta</h2>
      <p>{container.name}</p>
      <Form.Item name={'name'} label={'Carpeta de destino'}>
        <ContainerSelector />
      </Form.Item>
      <Form.Item name={'name'} label={'Carpeta de destino'}>
        <Input />
      </Form.Item>
      <PrimaryButton block htmlType={'submit'}>
        Mover
      </PrimaryButton>
    </Form>
  );
};

export default MoveContainer;
