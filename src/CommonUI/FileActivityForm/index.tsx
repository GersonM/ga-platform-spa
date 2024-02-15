import React, {useState} from 'react';
import {Button, Col, Form, Input, InputNumber, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ErrorHandler from '../../Utils/ErrorHandler';
import {ApiFile} from '../../Types/api';

interface FileActivityFormProps {
  file: ApiFile;
  type?: string;
  time?: number;
  onCompleted?: () => void;
}

const FileActivityForm = ({file, type, time, onCompleted}: FileActivityFormProps) => {
  const [loading, setLoading] = useState(false);
  const [commentForm] = useForm();

  const saveActivity = (values: any) => {
    setLoading(true);
    if (time) {
      values.time = time;
    }
    axios
      .post(`file-management/files/${file?.uuid}/activity`, values)
      .then(() => {
        setLoading(false);
        commentForm.resetFields();
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
    <div>
      <Form form={commentForm} onFinish={saveActivity} size={'small'}>
        <Row gutter={[10, 10]}>
          <Col md={24}>
            <Form.Item name={'comment'} noStyle>
              <Input.TextArea autoFocus={true} placeholder="Ingresa un comentario"></Input.TextArea>
            </Form.Item>
          </Col>
          {!time && (file.type.includes('vid') || file.type.includes('aud')) && (
            <>
              <Col md={24}>
                <Form.Item name={'time'} noStyle>
                  <InputNumber placeholder="Tiempo" addonAfter={'segundos'} />
                </Form.Item>
              </Col>
            </>
          )}
          {!type && (
            <Col md={14}>
              <Form.Item name={'action'} noStyle initialValue={'comment'}>
                <Select style={{width: '100%'}}>
                  <Select.Option value={'comment'}>Comentario</Select.Option>
                  <Select.Option value={'verified'}>Verificar</Select.Option>
                  <Select.Option value={'rejected'}>Rechazar</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          )}
          <Col md={24}>
            <Button loading={loading} block type={'primary'} htmlType={'submit'} ghost>
              Enviar
            </Button>
          </Col>
        </Row>
        {time && <span>El comentario se agregará en el segundo {time}</span>}
      </Form>
    </div>
  );
};

export default FileActivityForm;
