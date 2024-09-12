import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Dropdown, Empty, Form, Image, Input, MenuProps, Tag} from 'antd';
import {AiOutlineAlert} from 'react-icons/ai';
import {useDropzone} from 'react-dropzone';
import {GrSend} from 'react-icons/gr';
import dayjs from 'dayjs';
import {CalendarDaysIcon, ChatBubbleLeftIcon, ClockIcon, PaperClipIcon} from '@heroicons/react/24/outline';

import ErrorHandler from '../../Utils/ErrorHandler';
import PrimaryButton from '../PrimaryButton';
import IconButton from '../IconButton';
import {File} from '../../Types/api';

import './styles.less';

interface EntityActivityManagerProps {
  uuid: string;
  type: string;
}

const EntityActivityManager = ({uuid, type}: EntityActivityManagerProps) => {
  const [activity, setActivity] = useState<any[]>();
  const [message, setMessage] = useState<string>();
  const [reload, setReload] = useState(false);
  const [messageType, setMessageType] = useState<string>('entry');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        type,
      },
    };

    axios
      .get(`entity-activity/${uuid}`, config)
      .then(response => {
        if (response) {
          setActivity(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const submitMessage = () => {
    axios
      .post(`entity-activity`, {
        message,
        entity_type: type,
        type: messageType,
        uuid,
        files: files.map(f => f.uuid),
      })
      .then(() => {
        setMessage(undefined);
        setReload(!reload);
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
    console.log(type);
    setMessageType(type.key);
  };

  const getTypeIcon = (type: string, size = 18) => {
    switch (type) {
      case 'alert':
        return <AiOutlineAlert size={size} color={'#ff0000'} />;
      case 'schedule':
        return <CalendarDaysIcon width={size} />;
      case 'entry':
        return <ChatBubbleLeftIcon width={size} />;
    }
  };

  const onDrop = (acceptedFiles: Array<Blob>) => {
    //console.log(acceptedFiles);
    const formData = new FormData();
    acceptedFiles.forEach(item => {
      formData.append('file[]', item);
    });
    const config = {baseURL: import.meta.env.VITE_API_UPLOAD};
    axios
      .post('file-management/files', formData, config)
      .then(response => {
        setFiles([...files, ...response.data]);
      })
      .catch(error => {
        setReload(!reload);
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
          <Dropdown menu={{items, onClick: updateMessageType}} arrow>
            <div className="message-type-icon">{getTypeIcon(messageType)}</div>
          </Dropdown>
          <Form.Item noStyle>
            <Input allowClear variant={'borderless'} value={message} onChange={e => setMessage(e.target.value)} />
          </Form.Item>

          <IconButton onClick={open} icon={<PaperClipIcon />} />
          <PrimaryButton disabled={!message} icon={<GrSend size={16} />} label={'Enviar'} htmlType={'submit'} />
        </Form>
        <div>
          {files.map((f, index) => {
            return (
              <Tag
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
        </div>
      </div>
      {activity?.length == 0 && <Empty description={'Aún no hay actividad'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {activity?.map(a => {
        return (
          <div key={a.uuid} className={`activity-item ${a.type}`}>
            <div className={'author'}>{getTypeIcon(a.type, 25)}</div>
            <div className={'message'}>
              <p>{a.comment}</p>
              <small>
                <ClockIcon width={12} /> {dayjs(a.created_at).format('dddd DD MMMM YYYY hh:mm a')} por {a.profile.name}
              </small>
              <Image.PreviewGroup>
                {a.attachments?.map((at: File) => (
                  <Image
                    key={at.uuid}
                    preview={{
                      destroyOnClose: true,
                      src: at.source,
                    }}
                    loading={'lazy'}
                    src={at.thumbnail}
                    width={20}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EntityActivityManager;
