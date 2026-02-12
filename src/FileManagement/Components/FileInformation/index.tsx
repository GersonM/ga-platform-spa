import {useEffect, useState} from 'react';
import {Button, Col, Divider, Form, Image, Input, InputNumber, message, Row, Select, Space, Tag} from 'antd';
import {useForm} from 'antd/lib/form/Form';
import {BsThreeDotsVertical} from 'react-icons/bs';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {PiDownload, PiEye} from 'react-icons/pi';
import dayjs from 'dayjs';
import {TbCheck, TbRefreshDot, TbReload} from "react-icons/tb";
import axios from 'axios';

import type {Container, ApiFile, FileActivity} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import FileSize from '../../../CommonUI/FileSize';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import FileDropdownActions from '../FileDropdownActions';
import IconButton from '../../../CommonUI/IconButton';
import MediaPlayer from '../../../CommonUI/MediaPlayer';
import FileIcon from '../FileIcon';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContainerDropdownActions from "../ContainerDropdownActions";
import './styles.less';

interface FileInformationProps {
  file?: ApiFile;
  files?: ApiFile[];
  fileContainer?: Container;
  container?: Container;
  onChange?: () => void;
}

const FileInformation = ({fileContainer, files, onChange, container}: FileInformationProps) => {
  const [fileActivity, setFileActivity] = useState<Array<FileActivity>>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentForm] = useForm();

  useEffect(() => {
    if (files?.length == 1) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
        params: {},
      };
      setLoading(true);
      axios
        .get(`file-management/files/${files[0].uuid}/activity`, config)
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
  }, [files, reload]);

  const sendComment = (values: any) => {
    if (!files) return;
    axios
      .post(`file-management/files/${files[0]?.uuid}/activity`, values)
      .then(() => {
        setReload(!reload);
        commentForm.resetFields();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };
  const generateThumbnail = () => {
    if (!files) return;
    axios
      .post(`file-management/files/${files[0]?.uuid}/generate-thumbnail`)
      .then(() => {
        setReload(!reload);
        if (onChange) {
          onChange();
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

  const getViewer = (f: ApiFile) => {
    switch (true) {
      case f.type.includes('pdf'):
        return <iframe className={'iframe-viewer'} src={f.source} height={200}/>;
      case f.type.includes('image'):
        return (
          <Image
            placeholder={'Imagen'}
            title={f.name}
            src={f.thumbnail}
            preview={{src: f.source}}
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
            <FileIcon size={35} file={f}/>
            <br/>
            <br/>
            <code>{f.type}</code>
          </div>
        );
    }
  };

  const detailImageLink = files?.length == 1 ? location.origin + '/storage/files/' + files[0]?.uuid : '';
  const containerLink = container ? location.origin + '/storage/containers/' + container.uuid : '';

  return (
    <div className={'file-information-wrapper'}>
      {container && (
        <>
          <div className={'information-header'}>
            <div className={'file-name'}>
              <span className={'label'}>
                {container.name}
                <small>
                  {dayjs(container.created_at).format(' D/MM/YYYY [a las] H:mm')}
                </small>
              </span>
            </div>
            <ContainerDropdownActions
              onChange={() => {
                if (onChange) onChange();
              }}
              trigger={['click']}
              container={container}>
              <IconButton icon={<BsThreeDotsVertical/>}/>
            </ContainerDropdownActions>
          </div>
          <OverlayScrollbarsComponent defer options={{scrollbars: {autoHide: 'scroll'}}}>
            <div className="information-content">
              <p>Link para compartir</p>
              <pre>
                <small>
                  {containerLink}
                </small>
              </pre>
              <div className={'links-container'}>
                <span className="label">
                  <Button size={'small'} type={'link'} onClick={() => copyText(containerLink)}>
                    Copiar enlace
                  </Button>
                </span>
              </div>
            </div>
          </OverlayScrollbarsComponent>
        </>
      )}

      {files?.length == 1 && (
        <>
          <div className={'information-header'}>
            <div className={'file-name'}>
              <span className={'label'}>
                {files[0].name}
                <small>
                  <Tag color={'magenta'} bordered={false} style={{marginRight: 5}}>
                    <FileSize size={files[0].size}/>
                  </Tag>
                  {dayjs(files[0].created_at).format(' D/MM/YYYY [a las] H:mm')}
                </small>
              </span>
            </div>
            <FileDropdownActions
              onChange={() => {
                if (onChange) onChange();
              }}
              trigger={['click']}
              file={files[0]}>
              <IconButton icon={<BsThreeDotsVertical/>}/>
            </FileDropdownActions>
          </div>
          <OverlayScrollbarsComponent defer options={{scrollbars: {autoHide: 'scroll'}}}>
            <div className="information-content">
              {getViewer(files[0])}
              <Space>
                <IconButton
                  ghost
                  href={detailImageLink}
                  type={'primary'}
                  target="_blank"
                  icon={<PiEye/>}/>
                <IconButton
                  ghost
                  type={'primary'}
                  href={files[0].download}
                  target="_blank"
                  icon={<PiDownload/>}/>
                <IconButton
                  onClick={generateThumbnail}
                  ghost
                  title={'Generate Thumbnail'}
                  type={'primary'}
                  icon={<TbRefreshDot/>}/>
              </Space>
              <div className={'links-container'}>
                <span className="label">
                  Información de archivo:
                  <Button size={'small'} type={'link'} onClick={() => copyText(detailImageLink)}>
                    Copiar
                  </Button>
                </span>
                <pre>{detailImageLink}</pre>
                <span className="label">
                  Enlace el archivo:
                  <Button type={'link'} size={'small'} onClick={() => copyText(files[0].public)}>
                    Copiar
                  </Button>
                </span>
                {fileContainer?.is_public && (
                  <>
                    <pre>{files[0].public}</pre>
                    <span className="label">
                      URL pública:
                      <Button type={'link'} size={'small'} onClick={() => copyText(files[0].source)}>
                        Copiar
                      </Button>
                    </span>
                  </>
                )}
                <pre>{files[0].source}</pre>
                {files[0].thumbnail && <>
                  <div className="label">
                    URL miniatura:
                    <Button size={'small'} type={'link'} onClick={() => copyText(files[0].thumbnail)}>
                      Copiar
                    </Button>
                  </div>
                  <pre>{files[0].thumbnail}</pre>
                </>
                }
              </div>
              <Divider size={"small"}>Anotaciones <IconButton small icon={<TbReload/>}
                                                              onClick={() => setReload(!reload)}/></Divider>
              <div className={'activities-wrapper'}>
                <LoadingIndicator visible={loading} message={'Cargando actividad'}/>
                {fileActivity &&
                  fileActivity.map(a => (
                    <div key={a.uuid} className={`activity ${a.action}`}>
                      {(a.comment || a.time) && <>
                        {a.comment} {a.time}{a.verified_at && <TbCheck color={'green'}/>}
                      </>}
                      <small>
                        {a.action} por {a.user?.profile?.name} - <span
                        className={'date'}>{dayjs(a.created_at).format(' D/MM/YYYY H:mm a')}</span>
                      </small>
                    </div>
                  ))
                }
                <Form form={commentForm} onFinish={sendComment} size={'small'}>
                  <Row gutter={[10, 10]}>
                    <Col md={24}>
                      <Form.Item name={'comment'} noStyle>
                        <Input.TextArea placeholder="Ingresa un comentario"></Input.TextArea>
                      </Form.Item>
                    </Col>
                    {(files[0].type.includes('vid') || files[0].type.includes('aud')) && (
                      <>
                        <Col md={24}>
                          <Form.Item name={'time'} noStyle>
                            <InputNumber placeholder="Tiempo" addonAfter={'segundos'}/>
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
      {files && files.length > 1 && (
        <>
          <div className={'information-header'}>
            <div className={'file-name'}>
              <span className={'label'}>{files.length} archivos seleccionados</span>
            </div>
          </div>
          <OverlayScrollbarsComponent defer options={{scrollbars: {autoHide: 'scroll'}}}>
            <div className="information-content">
              {files.map(f => (
                <div key={f.uuid} className={'selected-file-item'} onClick={() => onChange && onChange()}>
                  <FileIcon size={19} file={f}/>
                  <div className={'file-info'}>
                    <span className={'name'}>{f.name}</span>
                    <span className={'size'}>
                      <FileSize size={f.size}/>
                    </span>
                  </div>
                </div>
              ))}
              <br/>
              <Space>
                <PrimaryButton disabled label={'Descargar'} href={files[0].download} block size={'small'}/>
                <PrimaryButton disabled label={'Borrar ' + files.length + ' archivos'} danger block size={'small'}/>
              </Space>
            </div>
          </OverlayScrollbarsComponent>
        </>
      )}
      {(files?.length == 0 && !container) && <EmptyMessage message={'Seleccionar un archivo para ver su información'}/>}
    </div>
  );
};

export default FileInformation;
