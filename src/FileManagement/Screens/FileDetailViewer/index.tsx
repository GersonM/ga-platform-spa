import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Button, Col, Divider, Image, Row, Space} from 'antd';
import {BiDownload} from 'react-icons/bi';
import dayjs from 'dayjs';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {File} from '../../../Types/api';
import AuthContext from '../../../Context/AuthContext';
import {version} from '../../../../package.json';

import './styles.less';

const FileDetailViewer = () => {
  const params = useParams();
  const [file, setFile] = useState<File>();
  const {config} = useContext(AuthContext);

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
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <>
      <div className={'file-detail-container'}>
        <h1>{file?.name}</h1>
        <small>
          {dayjs(file?.created_at).fromNow()} | {file?.type}
        </small>
        <Divider />
        <div>
          {file?.type.includes('image') && <Image src={file?.thumbnail} preview={{src: file?.source}} />}
          {file?.type.includes('vid') && <video className={'video-player'} controls src={file?.source} />}
          {file?.type.includes('aud') && <audio className={'audio-player'} controls src={file?.source} />}
        </div>
        <div className={'time-line-container'}>
          <Row gutter={[15, 15]} style={{margin: '15px 0'}}>
            {file?.activity
              ?.filter(a => a.action !== 'created')
              ?.map(a => {
                return (
                  <Col style={{textAlign: 'left'}}>
                    {a.comment} <br />
                    <small>{dayjs(a.created_at).format('h:m')}</small>
                  </Col>
                );
              })}
          </Row>
        </div>
        <Button icon={<BiDownload className={'button-icon'} />} type={'primary'} href={file?.download}>
          Descargar
        </Button>
        <Divider />
        <p>{file?.description || <span style={{opacity: 0.3}}>No se agrego una descripción</span>}</p>
      </div>
      <small style={{textAlign: 'center', opacity: 0.6, paddingBottom: 20}}>
        {config?.id} | V{version}
      </small>
    </>
  );
};

export default FileDetailViewer;
