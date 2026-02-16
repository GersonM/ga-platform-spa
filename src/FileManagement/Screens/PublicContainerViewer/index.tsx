import {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Divider, Empty, Image, Space} from 'antd';
import axios, {type AxiosError} from 'axios';
import dayjs from 'dayjs';

import type {ApiFile, Container} from '../../../Types/api';
import logo from '../../../Assets/ga_logo.webp';
import ErrorHandler from '../../../Utils/ErrorHandler';
import AuthContext from '../../../Context/AuthContext';
import {version} from '../../../../package.json';
import MetaTitle from '../../../CommonUI/MetaTitle';
import FolderItem from "../../Components/ContainerContentViewer/FolderItem.tsx";
import FileItem from "../../Components/ContainerContentViewer/FileItem.tsx";
import './styles.less';

const PublicContainerViewer = () => {
  const params = useParams();
  const {config, darkMode} = useContext(AuthContext);
  const [containers, setContainers] = useState<Container[]>();
  const [files, setFiles] = useState<ApiFile[]>();
  const [currentContainer, setCurrentContainer] = useState<Container>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`file-management/containers/${params.uuid}/public-content`, config)
      .then(response => {
        if (response) {
          setCurrentContainer(response.data.container);
          setContainers(response.data.containers);
          setFiles(response.data.files);
        }
      })
      .catch((e: AxiosError) => {
        ErrorHandler.showNotification(e);
        if (e.status == 401) {
          setErrorMessage('Esta carpeta es privada, inicia sesión para poder ver el contenido');
        } else {
          setErrorMessage(e.message);
        }
      });

    return cancelTokenSource.cancel;
  }, [params.uuid]);

  const tenantLogo = darkMode ? config?.dark_logo : config?.white_logo;

  return (
    <div className={'container-detail-wrapper'}>
      <MetaTitle title={currentContainer?.name || 'Privado'}/>
      <div className={'container-detail-container'}>
        <Space separator={<Divider orientation={'vertical'}/>}>
          <img src={tenantLogo ? tenantLogo : logo} alt="Logo" className={'logo'}/>
          <div>
            <h2 className={'title'}>{currentContainer?.name || 'Privado'}</h2>
            <small>
              {dayjs(currentContainer?.created_at).fromNow()} -
              ({dayjs(currentContainer?.created_at).format('DD [de] MMMM YYYY H:mm a')})
            </small>
          </div>
        </Space>
        {errorMessage ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={errorMessage} style={{padding: '100px 0'}}/>
          ) :
          <div className={'container-files-wrapper'}>
            {containers?.map((c: Container, index: number) => (
              <FolderItem size={60} container={c} key={index} onClick={() => navigate(`/storage/containers/${c.uuid}`)}/>
            ))}
            {files?.filter(f => !f.type.includes('image')).map((file: ApiFile, index: number) => (
              <FileItem file={file} key={index} onClick={() => navigate(`/storage/files/${file.uuid}`)}/>
            ))}
          </div>
        }

        <div className={'image-gallery'}>
          <Image.PreviewGroup>
            {files?.filter(f => f.type.includes('image')).map((file: ApiFile, index: number) => (
              <Image
                key={index}
                preview={{src:file.source}}
                src={file.thumbnail}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      </div>
      <div className={'footer'}>
        {config?.config.name} | V{version}
      </div>
    </div>
  );
};

export default PublicContainerViewer;
