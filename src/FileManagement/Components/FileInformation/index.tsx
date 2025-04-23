import React, {useEffect, useState} from 'react';
import {Button, Col, Divider, Form, Image, Input, InputNumber, message, Row, Select, Tag} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {BsThreeDotsVertical} from 'react-icons/bs';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {PiDownload, PiEye, PiImage} from 'react-icons/pi';
import dayjs from 'dayjs';
import axios from 'axios';

import {Container, ApiFile, FileActivity} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import FileSize from '../../../CommonUI/FileSize';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import FileDropdownActions from '../FileDropdownActions';
import IconButton from '../../../CommonUI/IconButton';
import MediaPlayer from '../../../CommonUI/MediaPlayer';
import FileIcon from '../FileIcon';
import './styles.less';

interface FileInformationProps {
  file?: ApiFile;
  fileContainer?: Container;
  onChange?: () => void;
}

const FileInformation = ({fileContainer, file, onChange}: FileInformationProps) => {
  const [fileActivity, setFileActivity] = useState<Array<FileActivity>>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const generateThumbnail = () => {
    axios
      .post(`file-management/files/${file?.uuid}/generate-thumbnail`)
      .then(() => {
        setReload(!reload);
        onChange && onChange();
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

  const getViewer = (f: ApiFile) => {
    switch (true) {
      case f.type.includes('pdf'):
        return <iframe className={'iframe-viewer'} src={f.source} height={200} />;
      case f.type.includes('image'):
        return (
          <Image
            placeholder={'Imagen'}
            title={f.name}
            src={f.thumbnail}
            style={{margin: '0 auto'}}
            wrapperStyle={{marginBottom: 10}}
          />
        );
      case f.type.includes('vid') || f.type.includes('aud'):
        return (
          <MediaPlayer
            startTime={f.start_from}
            onActivityChange={() => setReload(!reload)}
            media={f}
            showControls={false}
          />
        );
      default:
        return (
          <div className={'file-preview-item'}>
            <p>Vista previa no disponible para este tipo de archivos</p>
            <FileIcon width={50} size={50} file={f} />
            <pre style={{textWrap: 'wrap'}}>{f.type}</pre>
          </div>
        );
    }
  };

  const detailImageLink = location.origin + '/storage/files/' + file?.uuid;

  return (
    <div className={'file-information-wrapper'}>
      {!file ? (
        <EmptyMessage message={'Seleccionar un archivo para ver su información'} />
      ) : (
        <>
          <div className={'information-header'}>
            <div className={'file-name'}>
              <span className={'label'}>
                {file.name}
                <small>
                  <Tag color={'magenta'} style={{marginRight: 5}}>
                    <FileSize size={file.size} />
                  </Tag>
                  {dayjs(file.created_at).format(' D/MM/YYYY [a las] H:mm')}
                </small>
              </span>
            </div>
            <FileDropdownActions
              onChange={() => {
                if (onChange) onChange();
              }}
              trigger={['click']}
              file={file}>
              <IconButton icon={<BsThreeDotsVertical />} />
            </FileDropdownActions>
          </div>
          <OverlayScrollbarsComponent defer options={{scrollbars: {autoHide: 'scroll'}}}>
            <div className="information-content">
              {getViewer(file)}
              <Row gutter={[10, 10]}>
                <Col md={12}>
                  <Button
                    size={'small'}
                    ghost
                    block
                    href={detailImageLink}
                    type={'primary'}
                    target="_blank"
                    icon={<PiEye size={18} style={{marginTop: 1}} />}>
                    Ver
                  </Button>
                </Col>
                <Col md={12}>
                  <Button
                    ghost
                    size={'small'}
                    block
                    type={'primary'}
                    href={file.download}
                    target="_blank"
                    icon={<PiDownload size={18} style={{marginTop: 1}} />}>
                    Descargar
                  </Button>
                </Col>
                <Col md={24}>
                  <Button
                    ghost
                    size={'small'}
                    onClick={generateThumbnail}
                    block
                    type={'primary'}
                    variant={'text'}
                    icon={<PiImage size={18} style={{marginTop: 1}} />}>
                    Regenerar thumbnail
                  </Button>
                </Col>
              </Row>
              <div className={'links-container'}>
                <span className="label">
                  Información de archivo:{' '}
                  <Button size={'small'} type={'link'} onClick={() => copyText(detailImageLink)}>
                    Copiar
                  </Button>
                </span>
                <pre>{detailImageLink}</pre>
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
              <Divider>Anotaciones</Divider>
              <div className={'activities-wrapper'}>
                <LoadingIndicator visible={loading} message={'Cargando actividad'} />
                {fileActivity &&
                  fileActivity.map(a => (
                    <div key={a.uuid} className={`activity ${a.action}`}>
                      <span className={'message'}>{a.comment}</span>
                      <small>
                        {a.action} por {a.user?.profile?.name}
                      </small>
                      <span className={'date'}>{dayjs(a.created_at).format(' D/MM/YYYY [a las] H:mm')}</span>
                    </div>
                  ))}
                <Form form={commentForm} onFinish={sendComment} size={'small'}>
                  <Row gutter={[10, 10]}>
                    <Col md={24}>
                      <Form.Item name={'comment'} noStyle>
                        <Input.TextArea placeholder="Ingresa un comentario"></Input.TextArea>
                      </Form.Item>
                    </Col>
                    {(file.type.includes('vid') || file.type.includes('aud')) && (
                      <>
                        <Col md={24}>
                          <Form.Item name={'time'} noStyle>
                            <InputNumber placeholder="Tiempo" addonAfter={'segundos'} />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    <Col md={14}>
                      <Form.Item name={'action'} noStyle initialValue={'comment'}>
                        <Select style={{width: '100%'}}>
                          <Select.Option value={'comment'}>Comentario</Select.Option>
                          <Select.Option value={'verified'}>Verificar</Select.Option>
                          <Select.Option value={'rejected'}>Rechazar</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col md={10}>
                      <Button block type={'primary'} htmlType={'submit'} ghost>
                        Enviar
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </OverlayScrollbarsComponent>
        </>
      )}
    </div>
  );
};

export default FileInformation;
