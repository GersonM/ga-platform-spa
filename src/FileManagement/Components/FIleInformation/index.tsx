import React, {useEffect, useState} from 'react';
import {Button, Col, Divider, Form, Input, message, Row, Select} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {BsThreeDotsVertical} from 'react-icons/all';
import dayjs from 'dayjs';
import axios from 'axios';

import './styles.less';
import FileIcon from '../FileIcon';
import {Container, File, FileActivity} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import FileSize from '../../../CommonUI/FileSize';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import FileDropdownActions from '../FileDropdownActions';

interface FileInformationProps {
  file?: File;
  fileContainer?: Container;
  onChange?: () => void;
}

const FileInformation = ({fileContainer, file, onChange}: FileInformationProps) => {
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

  const copyText = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        message.success('Copiado al portapapeles').then();
      });
    }
  };

  return (
    <div className={'file-information-wrapper'}>
      {!file ? (
        <EmptyMessage message={'Seleccionar un archivo para ver su información'} />
      ) : (
        <>
          <div className={'information-header'}>
            <h4>Información del archivo</h4>
            <FileDropdownActions
              onChange={() => {
                if (onChange) onChange();
              }}
              trigger={['click']}
              file={file}>
              <BsThreeDotsVertical className={'icon'} />
            </FileDropdownActions>
          </div>
          <div className="information-content">
            <div className={'file-name'}>
              <FileIcon file={file} />
              <span className={'label'}>
                {file.name}
                <small>
                  <FileSize size={file.size} /> - {dayjs(file.created_at).format(' D/MM/YYYY [a las] H:mm')}
                </small>
              </span>
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
                      <Input.TextArea placeholder="Ingresa un comentario"></Input.TextArea>
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
                Enlace el archivo:{' '}
                <Button type={'link'} size={'small'} onClick={() => copyText(file.public)}>
                  Copiar
                </Button>
              </span>
              {fileContainer?.is_public && (
                <>
                  <pre>{file.public}</pre>
                  <span className="label">
                    URL pública:{' '}
                    <Button type={'link'} size={'small'} onClick={() => copyText(file.source)}>
                      Copiar
                    </Button>
                  </span>
                </>
              )}
              <pre>{file.source}</pre>
              <span className="label">
                URL miniatura:{' '}
                <Button size={'small'} type={'link'} onClick={() => copyText(file.thumbnail)}>
                  Copiar
                </Button>
              </span>
              <pre>{file.thumbnail}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileInformation;
