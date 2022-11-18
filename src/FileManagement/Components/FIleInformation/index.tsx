import React, {useEffect, useState} from 'react';
import {Button, Col, Divider, Empty, Form, message, Row, Select} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import {useForm} from 'antd/lib/form/Form';
import dayjs from 'dayjs';
import axios from 'axios';

import './styles.less';
import FileIcon from '../FileIcon';
import {File, FileActivity} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import FileSize from '../../../CommonUI/FileSize';

interface FileInformationProps {
  file?: File;
  onDelete?: () => void;
}

const FileInformation = ({file, onDelete}: FileInformationProps) => {
  const [fileActivity, setFileActivity] = useState<Array<FileActivity>>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commentForm] = useForm();

  useEffect(() => {
    if (file) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
        params: {},
      };
      setLoading(true);
      axios
        .get(`file-management/files/${file.uuid}/activity`, config)
        .then(response => {
          setLoading(false);
          if (response) {
            setFileActivity(response.data);
          }
        })
        .catch(e => {
          setLoading(false);
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [file, reload]);

  const sendComment = (values: any) => {
    axios
      .post(`file-management/files/${file?.uuid}/activity`, values)
      .then(() => {
        setReload(!reload);
        commentForm.resetFields();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const deleteFile = () => {
    axios
      .delete(`file-management/files/${file?.uuid}`)
      .then(() => {
        if (onDelete) {
          onDelete();
        }
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const copyText = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        message.success('Copiado al portapapeles').then();
      });
    }
  };

  return (
    <div className={'file-information-wrapper'}>
      <h3>Información del archivo</h3>
      {!file ? (
        <>
          <Empty description={'Seleccionar un archivo para ver su información'} />
        </>
      ) : (
        <>
          <div className={'file-name'}>
            <FileIcon file={file} />
            <span className={'label'}>
              {file.name}
              <small>
                <FileSize size={file.size} /> - {dayjs(file.created_at).format(' D/MM/YYYY [a las] H:mm')}
              </small>
            </span>
            <Button size={'small'} type={'link'} className={'button-delete'} onClick={deleteFile}>
              <span className="icon icon-trash2" />
            </Button>
          </div>
          <div className={'activities-wrapper'}>
            <h3>Actividad</h3>
            <LoadingIndicator visible={loading} message={'Cargando actividad'} />
            {fileActivity &&
              fileActivity.map(a => (
                <div key={a.uuid} className={`activity ${a.action}`}>
                  <span className={'message'}>{a.comment}</span>
                  <small>
                    {a.action} by {a.user.name}
                  </small>
                  <span className={'date'}>{dayjs(a.created_at).format(' D/MM/YYYY [a las] H:mm')}</span>
                </div>
              ))}
            <Form form={commentForm} onFinish={sendComment}>
              <Row gutter={[10, 10]}>
                <Col md={24}>
                  <Form.Item name={'comment'} noStyle>
                    <TextArea placeholder="Ingresa un comentario"></TextArea>
                  </Form.Item>
                </Col>
                <Col md={14}>
                  <Form.Item name={'action'} noStyle initialValue={'comment'}>
                    <Select size={'small'} style={{width: '100%'}}>
                      <Select.Option value={'comment'}>Comentar</Select.Option>
                      <Select.Option value={'verified'}>Verificar</Select.Option>
                      <Select.Option value={'rejected'}>Rechazar</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col md={10}>
                  <Button block size={'small'} type={'primary'} htmlType={'submit'} ghost>
                    Enviar
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          <Divider />
          <div className={'image-preview'}>
            <a href={file.source} target="_blank" rel="noreferrer">
              <img src={file.thumbnail} alt="" />
            </a>
          </div>
          <Button
            href={file.source}
            block
            size={'small'}
            target="_blank"
            icon={<span className="button-icon icon-cloud-download"></span>}>
            Descargar
          </Button>
          <Divider />
          <div className={'links-container'}>
            <span className="label">
              URL pública:{' '}
              <Button type={'link'} size={'small'} onClick={() => copyText(file.source)}>
                Copiar
              </Button>
            </span>
            <pre>{file.source}</pre>
            <span className="label">
              URL miniatura:{' '}
              <Button size={'small'} type={'link'} onClick={() => copyText(file.thumbnail)}>
                Copiar
              </Button>
            </span>
            <pre>{file.thumbnail}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export default FileInformation;
