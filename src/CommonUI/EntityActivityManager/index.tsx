import {useEffect, useState} from 'react';
import axios from 'axios';
import {DatePicker, Dropdown, Empty, Form, Image, Input, MenuProps, Space, Tag, Tooltip} from 'antd';
import {AiOutlineAlert} from 'react-icons/ai';
import {useDropzone} from 'react-dropzone';
import {GrSend} from 'react-icons/gr';
import {PiCaretDownBold} from 'react-icons/pi';
import {IoAttach} from 'react-icons/io5';
import dayjs, {Dayjs} from 'dayjs';
import {CalendarDaysIcon, ChatBubbleLeftIcon, PaperClipIcon} from '@heroicons/react/24/outline';

import ErrorHandler from '../../Utils/ErrorHandler';
import PrimaryButton from '../PrimaryButton';
import IconButton from '../IconButton';
import type {ApiFile} from '../../Types/api';

import Config from '../../Config';
import FileIcon from '../../FileManagement/Components/FileIcon';
import SearchProfile from '../SearchProfile';
import EntityActivityIcon from './EntityActivityIcon';
import EntityActivityCardViewer from '../../EntityActivity/Components/EntityActivityCardViewer';
import './styles.less';

interface EntityActivityManagerProps {
  uuid: string;
  type: string;
  refresh?: boolean;
}

const EntityActivityManager = ({uuid, type, refresh}: EntityActivityManagerProps) => {
  const [activity, setActivity] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [message, setMessage] = useState<string>();
  const [messageType, setMessageType] = useState<string>('entry');
  const [messageDate, setMessageDate] = useState<Dayjs>();
  const [messageAssignedTo, setMessageAssignedTo] = useState();
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [_uploading, setUploading] = useState(false);
  const [selectedActivityUUID, setSelectedActivityUUID] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        entity_id: uuid,
      },
    };
    setLoading(true);
    axios
      .get(`entity-activity`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setActivity(response.data.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, refresh]);

  const submitMessage = () => {
    axios
      .post(`entity-activity`, {
        message,
        entity_type: type,
        expired_at: messageDate?.format(Config.dateFormatServer),
        type: messageType,
        assigned_uuid: messageAssignedTo,
        uuid,
        files: files.map(f => f.uuid),
      })
      .then(() => {
        setMessage(undefined);
        setReload(!reload);
        setMessageDate(undefined);
        setMessageAssignedTo(undefined);
        setFiles([]);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const items: MenuProps['items'] = [
    {
      label: 'Mensaje',
      key: 'entry',
      icon: <ChatBubbleLeftIcon width={20} />,
    },
    {
      label: 'Tarea',
      key: 'schedule',
      icon: <CalendarDaysIcon width={20} />,
    },
    {
      label: 'Alerta',
      key: 'alert',
      danger: true,
      icon: <AiOutlineAlert size={20} />,
    },
  ];

  const updateMessageType = (type: any) => {
    setMessageType(type.key);
  };

  const onDrop = (acceptedFiles: Array<Blob>) => {
    const formData = new FormData();
    acceptedFiles.forEach(item => {
      formData.append('file[]', item);
    });
    const config = {baseURL: import.meta.env.VITE_API_UPLOAD};
    setUploading(true);
    axios
      .post('file-management/files', formData, config)
      .then(response => {
        setUploading(false);
        setFiles([...files, ...response.data]);
      })
      .catch(error => {
        setUploading(false);
        ErrorHandler.showNotification(error);
      });
  };

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    noKeyboard: true,
    noClick: true,
  });

  return (
    <div {...getRootProps()} className={'activity-wrapper'}>
      <input {...getInputProps()} />
      <div className={'message-form-wrapper'}>
        {isDragActive && <div className={'drop-message'}>Suelta archivos para cargar</div>}
        <Form onFinish={submitMessage}>
          <Dropdown menu={{items, onClick: updateMessageType}} arrow={true}>
            <div className="message-type-icon">
              <EntityActivityIcon type={messageType} />
              <PiCaretDownBold />
            </div>
          </Dropdown>
          <Form.Item noStyle>
            <Input
              placeholder={'Mensaje'}
              allowClear
              variant={'borderless'}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </Form.Item>

          <IconButton onClick={open} loading={loading} icon={<PaperClipIcon />} />
          <PrimaryButton
            disabled={files.length == 0 && !message}
            icon={<GrSend size={16} />}
            label={'Enviar'}
            htmlType={'submit'}
          />
        </Form>
        {(messageType != 'entry' || files.length > 0) && (
          <div className={'message-form-addons'}>
            <DatePicker
              allowClear
              value={messageDate}
              size={'small'}
              placeholder={'Fecha de límite para solución'}
              style={{width: '100%'}}
              onChange={date => setMessageDate(date)}
            />
            <SearchProfile
              placeholder={'Asignar tarea (opcional)'}
              style={{marginTop: 5}}
              onChange={value => setMessageAssignedTo(value)}
              filter_type={'employee'}
              size={'small'}
            />
            {files.length > 0 && (
              <Space wrap style={{marginTop: '5px'}}>
                {files.map((f, index) => {
                  return (
                    <Tag
                      icon={<IoAttach size={14} style={{verticalAlign: 'middle'}} />}
                      bordered={false}
                      color={'blue'}
                      key={index}
                      closable
                      onClose={() => {
                        const newFiles = [...files];
                        newFiles.splice(
                          files.findIndex(fi => f.uuid === fi.uuid),
                          1,
                        );
                        setFiles(newFiles);
                      }}>
                      {f.name}
                    </Tag>
                  );
                })}
              </Space>
            )}
          </div>
        )}
      </div>
      {activity?.length == 0 && <Empty description={'Aún no hay actividad'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {activity?.map(a => {
        return (
          <div key={a.uuid} className={`activity-item ${a.type}`} onClick={() => setSelectedActivityUUID(a.uuid)}>
            <div className={'author'}>
              <EntityActivityIcon type={a.type} size={25} />
              <br />
              {a.expired_at && <small>{dayjs(a.expired_at).format('DD/MM')}</small>}
            </div>
            <div className={'message'}>
              <p>{a.comment}</p>
              <small>
                {dayjs(a.created_at).format('dddd DD MMMM YYYY hh:mm a')} por {a.profile.name}
              </small>
              <Image.PreviewGroup>
                {a.attachments?.map((at: ApiFile) => (
                  <>
                    {at.type.includes('ima') ? (
                      <Image
                        key={at.uuid}
                        preview={{
                          destroyOnClose: true,
                          src: at.source,
                        }}
                        loading={'lazy'}
                        src={at.thumbnail}
                        width={30}
                      />
                    ) : (
                      <Tooltip title={at.name}>
                        <a href={at.source} target={'_blank'}>
                          <FileIcon file={at} size={25} />
                        </a>
                      </Tooltip>
                    )}
                  </>
                ))}
              </Image.PreviewGroup>
            </div>
          </div>
        );
      })}
      <EntityActivityCardViewer
        onCancel={() => {
          setSelectedActivityUUID(undefined);
          setReload(!reload);
        }}
        entityActivityUUID={selectedActivityUUID}
      />
    </div>
  );
};

export default EntityActivityManager;
