import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Col, Divider, Image, Row, Space, Timeline} from 'antd';
import {ChatBubbleBottomCenterIcon, ClockIcon} from '@heroicons/react/24/outline';
import {PiDownloadDuotone} from 'react-icons/pi';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {File} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import {version} from '../../../../package.json';
import MediaPlayer from '../../../CommonUI/MediaPlayer';
import logo from '../../../Assets/logo_full.png';

import './styles.less';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileIcon from '../../Components/FileIcon';
import FileItem from '../../Components/ContainerContentViewer/FileItem';
import FileSize from '../../../CommonUI/FileSize';

const FileDetailViewer = () => {
  const params = useParams();
  const [file, setFile] = useState<File>();
  const {config, darkMode} = useContext(AuthContext);
  const [reload, setReload] = useState(true);
  const [initTime, setInitTime] = useState<number>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`storage/files/${params.uuid}`, config)
      .then(response => {
        if (response) {
          setFile(response.data);
          setInitTime(response.data.time);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const showAnnotations = file?.activity && file?.activity?.filter(a => a.action !== 'created').length > 0;
  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;

  const getViewer = (f: File) => {
    switch (true) {
      case f.type.includes('pdf'):
        return <iframe className={'pdf-viewer-iframe'} src={f.source} height={'100vwh'} />;
      case f.type.includes('image'):
        return <Image placeholder={'Imagen'} title={f.name} src={f.source} />;
      case f.type.includes('vid') || f.type.includes('aud'):
        return <MediaPlayer startTime={initTime} onActivityChange={() => setReload(!reload)} media={f} />;
      default:
        return (
          <div className={'file-preview-item'}>
            <FileIcon file={f} />
            <p>
              {f.name}
              <small> {f.type}</small>
            </p>
            <p>
              <FileSize size={f.size} />
            </p>
            <small>Vista previa no disponible para este tipo de archivos</small>
          </div>
        );
    }
  };

  return (
    <div className={'file-detail-wrapper'}>
      <div className={'file-detail-container'}>
        <Space size={'large'} align={'start'}>
          <img src={tenantLogo ? tenantLogo : logo} alt="Logo" className={'logo'} />
          <div>
            <h2 className={'title'}>{file?.name}</h2>
            <small>
              {dayjs(file?.created_at).fromNow()} - ({dayjs(file?.created_at).format('DD MMMM YYYY H:mm a')})
            </small>
          </div>
        </Space>
        <Divider />
        <Row gutter={10}>
          {showAnnotations && (
            <Col md={5}>
              <div className={'time-line-container'}>
                <h3>Anotaciones</h3>
                <br />
                {file?.activity && (
                  <Timeline
                    items={file?.activity
                      ?.filter(a => a.action !== 'created')
                      ?.map(a => {
                        return {
                          dot: a.time ? <ClockIcon width={16} /> : <ChatBubbleBottomCenterIcon width={16} />,
                          children: (
                            <div className={'timeline-item'} onClick={() => setInitTime(a.time)}>
                              {a.comment} <br />
                              <small>
                                {a.time ? 'Ir a segundo ' + a.time : dayjs(a.created_at).format('D/M/YY [a las] h:m a')}
                              </small>
                            </div>
                          ),
                        };
                      })}
                  />
                )}
              </div>
            </Col>
          )}

          <Col md={showAnnotations ? 19 : 24}>
            {file && (
              <div className={'file-container'}>
                <div className={'file-description'}>
                  <p>{file.description || <span style={{opacity: 0.3}}>No se agrego una descripción</span>}</p>
                  <PrimaryButton
                    icon={<PiDownloadDuotone className={'button-icon'} />}
                    label={'Descargar'}
                    href={file?.download}
                  />
                </div>
                {getViewer(file)}
              </div>
            )}
          </Col>
        </Row>
      </div>
      <div className={'footer'}>
        {config?.config.name} | V{version}
      </div>
    </div>
  );
};

export default FileDetailViewer;
