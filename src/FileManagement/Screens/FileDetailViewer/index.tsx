import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Col, Divider, Image, Row, Space, Timeline} from 'antd';
import {ChatBubbleBottomCenterIcon, ClockIcon} from '@heroicons/react/24/outline';
import {PiDownloadDuotone} from 'react-icons/pi';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {ApiFile} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import {version} from '../../../../package.json';
import MediaPlayer from '../../../CommonUI/MediaPlayer';
import logo from '../../../Assets/logo_full.png';

import './styles.less';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import FileIcon from '../../Components/FileIcon';
import FileSize from '../../../CommonUI/FileSize';

const FileDetailViewer = () => {
  const params = useParams();
  const [file, setFile] = useState<ApiFile>();
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

  const getViewer = (f: ApiFile) => {
    switch (true) {
      case f.type.includes('pdf'):
        return <iframe className={'pdf-viewer-iframe'} src={f.source} height={'100vwh'} />;
      case f.name.includes('psd'):
        return <Image placeholder={'Imagen'} title={f.name} src={f.thumbnail} />;
      case f.type.includes('image'):
        return <Image placeholder={'Imagen'} title={f.name} src={f.source} />;
      case f.type.includes('vid') || f.type.includes('aud'):
        return <MediaPlayer startTime={initTime} onActivityChange={() => setReload(!reload)} media={f} />;
      default:
        return (
          <div className={'file-preview-item'}>
            <p>Vista previa no disponible para este tipo de archivos</p>
            <br />
            <br />
            <br />
            <FileIcon size={80} file={f} />
            <p>
              {f.name} <br />
              <small> {f.type}</small> <br />
              <FileSize size={f.size} />
            </p>
            <p></p>
          </div>
        );
    }
  };

  return (
    <div className={'file-detail-wrapper'}>
      <div className={'file-detail-container'}>
        <Space align={'center'}>
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
            <Col xs={24} sm={5} md={5}>
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
          <Col xs={24} sm={showAnnotations ? 19 : 24}>
            {file && (
              <div className={'file-container'}>
                <p>{file.description || <span style={{opacity: 0.3}}>No se agrego una descripción</span>}</p>
                {getViewer(file)}
                <div style={{marginTop: 15, textAlign: 'center'}}>
                  <PrimaryButton
                    icon={<PiDownloadDuotone className={'button-icon'} />}
                    label={'Descargar'}
                    href={file?.download}
                  />
                </div>
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
