import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Button, Col, Divider, Image, Row, Space, Timeline} from 'antd';
import {BiDownload} from 'react-icons/bi';
import dayjs from 'dayjs';
import {ChatBubbleBottomCenterIcon, ClockIcon} from '@heroicons/react/24/outline';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {File} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import {version} from '../../../../package.json';
import MediaPlayer from '../../../CommonUI/MediaPlayer';

import './styles.less';
import logo from '../../../Assets/logo_full.png';

const FileDetailViewer = () => {
  const params = useParams();
  const [file, setFile] = useState<File>();
  const {config} = useContext(AuthContext);
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

  return (
    <div className={'file-detail-wrapper'}>
      <div className={'file-detail-container'}>
        <Space size={'large'} align={'start'}>
          <img src={config?.logo ? config.logo : logo} alt="Logo" className={'logo'} />
          <div>
            <h2 className={'title'}>{file?.name}</h2>
            <small>{dayjs(file?.created_at).fromNow()}</small>
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
                {file.type.includes('image') && <Image src={file.source} />}
                {(file.type.includes('vid') || file.type.includes('aud')) && (
                  <MediaPlayer startTime={initTime} onActivityChange={() => setReload(!reload)} media={file} />
                )}
              </div>
            )}
            <Button
              shape={'round'}
              icon={<BiDownload className={'button-icon'} />}
              type={'primary'}
              target={'_blank'}
              href={file?.public}>
              Descargar
            </Button>
            <Divider />
            <p>{file?.description || <span style={{opacity: 0.3}}>No se agrego una descripción</span>}</p>
          </Col>
        </Row>
      </div>
      <div className={'footer'}>
        {config?.name} | V{version}
      </div>
    </div>
  );
};

export default FileDetailViewer;
