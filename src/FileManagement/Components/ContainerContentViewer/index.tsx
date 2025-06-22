import {useCallback, useContext, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Button, Empty, Input, Space} from 'antd';
import axios from 'axios';
import {PiArrowLeft, PiRecycle, PiUploadBold} from 'react-icons/pi';

import FileItem from './FileItem';
import FolderItem from './FolderItem';
import FileInformation from '../FileInformation';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import type {Container, ContainerContent, ApiFile} from '../../../Types/api';
import ContainerHeader from '../../Screens/CompanyContainers/ContainerHeader';
import DropMessage from './DropMessage';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import UploadContext from '../../../Context/UploadContext';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import IconButton from '../../../CommonUI/IconButton';
import './styles.less';

interface ContainerContentViewerProps {
  containerUuid: string;
  allowUpload: boolean;
  onChange?: (containerUuid: string, container: Container) => void;
}

const ContainerContentViewer = ({allowUpload, onChange, containerUuid}: ContainerContentViewerProps) => {
  const [containerContent, setContainerContent] = useState<ContainerContent>();
  const [selectedFiles, setSelectedFiles] = useState<ApiFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [showFileInformation, setShowFileInformation] = useState<boolean>();
  const [viewMode, setViewMode] = useState<string | number>();
  const [orderBy, setOrderBy] = useState('name');
  const [searchValue, setSearchValue] = useState<string>();
  const {addFile, lastFileCompleted} = useContext(UploadContext);

  useEffect(() => {
    setReload(!reload);
  }, [lastFileCompleted]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      for (const acceptedFilesKey in acceptedFiles) {
        addFile(acceptedFiles[acceptedFilesKey], containerUuid);
      }
    },
    [addFile, containerUuid],
  );

  useEffect(() => {
    setSelectedFiles([]);
    setSearchValue(undefined);
    setContainerContent(undefined);
  }, [containerUuid]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        order_by: orderBy,
        search: searchValue,
      },
    };
    setLoading(true);
    axios
      .get(searchValue ? 'file-management/search' : `file-management/containers/${containerUuid}/view`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setContainerContent(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [containerUuid, reload, orderBy, searchValue]);

  const navigateToFolder = (container: Container) => {
    setSelectedFiles([]);
    if (onChange) {
      onChange(container.uuid, container);
    }
  };

  const downloadFile = (file: ApiFile) => {
    const tenant = axios.defaults.headers.common['X-Tenant'];
    const link =
      'https://' + import.meta.env.VITE_WEB + '/' + tenant + `/storage/file-management/files/${file.uuid}/download`;
    const element = document.getElementById('my_iframe');
    if (element) {
      // @ts-ignore
      element.src = link;
    }
  };

  const navigateToParent = () => {
    if (containerContent) {
      if (containerContent.container?.parent_container) {
        navigateToFolder(containerContent.container.parent_container);
      }
    }
  };

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    noKeyboard: true,
    noClick: true,
  });

  const emptyTrash = () => {
    axios
      .post(`file-management/trash/empty`)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  if(!containerContent) {
    return <LoadingIndicator  visible={true} message={'Listando contenido...'} />;
  }

  return (
    <div {...getRootProps()} className={'content-viewer-wrapper'}>
      <iframe id="my_iframe" style={{display: 'none'}}></iframe>
      <input {...getInputProps()} />
      {containerContent && (
        <>
          {containerContent.container && (
            <ContainerHeader
              container={containerContent.container}
              allowUpload={allowUpload}
              upLevel={navigateToParent}
              onChange={() => setReload(!reload)}
              onReload={() => setReload(!reload)}
              onSearch={value => setSearchValue(value)}
              onChangeOrder={order => setOrderBy(order)}
              onOpenUpload={open}
              onChangeViewMode={mode => setViewMode(mode)}
              onToggleInformation={value => setShowFileInformation(value)}
            />
          )}
          {searchValue && !containerContent.container && (
            <ContentHeader
              bordered
              title={'Resultados de búsqueda'}
              description={containerContent.files.length + ' archivos encontrados'}
              tools={
                <Space>
                  <Input.Search
                    placeholder={searchValue ?? 'Buscar'}
                    allowClear
                    onSearch={value => {
                      setSearchValue(value);
                    }}
                  />
                  <IconButton title={'Volver'} icon={<PiArrowLeft />} onClick={() => setSearchValue(undefined)} />
                </Space>
              }
            />
          )}
          <div className="file-navigator-wrapper">
            {isDragActive && <DropMessage />}
            {showFileInformation && (
              <FileInformation
                fileContainer={containerContent.container}
                files={selectedFiles}
                onChange={() => {
                  setReload(!reload);
                }}
              />
            )}
            {containerUuid === 'trash' && (
              <div style={{marginBottom: 15}}>
                <PrimaryButton label={'Vaciar papelera'} icon={<PiRecycle />} onClick={emptyTrash} />
              </div>
            )}
            {containerContent.containers.length === 0 && containerContent.files.length === 0 ? (
              <div style={{flex: 1}}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <>
                      <span>No hay archivos en esta ubicación</span> <br />
                      <br />
                      {allowUpload && !searchValue && (
                        <>
                          <strong>Haz clic en "Cargar archivos" o arrastra y suelta algunos aquí</strong> <br />
                          <br />
                          <Button ghost icon={<PiUploadBold />} onClick={open} shape={'round'} type={'primary'}>
                            Cargar archivos
                          </Button>
                        </>
                      )}
                    </>
                  }
                />
              </div>
            ) : (
              <div className={`files-container mode-${viewMode}`}>
                <LoadingIndicator visible={loading} />
                {containerContent.containers.map(c => (
                  <FolderItem
                    size={viewMode == 'grid' ? 45 : 28}
                    key={c.uuid}
                    container={c}
                    onDoubleClick={() => navigateToFolder(c)}
                    onChange={() => setReload(!reload)}
                  />
                ))}
                {containerContent.files.map(file => (
                  <FileItem
                    size={viewMode == 'grid' ? 45 : 28}
                    key={file.uuid}
                    selected={selectedFiles.findIndex(f => f.uuid === file.uuid) != -1}
                    file={file}
                    onChange={() => setReload(!reload)}
                    onDoubleClick={() => downloadFile(file)}
                    onClick={(_selected, evt) => {
                      if (evt.shiftKey) {
                        if (selectedFiles.findIndex(f => f.uuid === file.uuid) == -1) {
                          setSelectedFiles([...selectedFiles, file]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(f => f.uuid !== file.uuid));
                        }
                      } else {
                        setSelectedFiles([file]);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContainerContentViewer;
