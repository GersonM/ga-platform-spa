import React, {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Button, Empty} from 'antd';
import axios, {AxiosProgressEvent} from 'axios';

import './styles.less';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import FileInformation from '../FIleInformation';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import {Container, ContainerContent, File} from '../../../Types/api';
import ContainerHeader from '../../Screens/CompanyContainers/ContainerHeader';
import UploadInformation from '../UploadInformation';
import DropMessage from './DropMessage';

interface ContainerContentViewerProps {
  containerUuid: string;
  onChange?: (containerUuid: string, container: Container) => void;
}

const ContainerContentViewer = ({onChange, containerUuid}: ContainerContentViewerProps) => {
  const [containerContent, setContainerContent] = useState<ContainerContent>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [showFileInformation, setShowFileInformation] = useState(true);
  const [viewMode, setViewMode] = useState<string>();
  const [loadingInformation, setLoadingInformation] = useState<AxiosProgressEvent>();
  const [uploadingFiles, setUploadingFiles] = useState<Array<any>>();

  const onDrop = useCallback(
    (acceptedFiles: Array<Blob>) => {
      const formData = new FormData();
      formData.append('container_uuid', containerUuid);
      acceptedFiles.forEach(item => {
        formData.append('file[]', item);
      });
      setUploadingFiles(acceptedFiles);
      const config = {
        onUploadProgress: (r: AxiosProgressEvent) => {
          setLoadingInformation(r);
        },
      };
      axios
        .post('file-management/files', formData, config)
        .then(() => {
          setReload(!reload);
        })
        .catch(error => {
          setReload(!reload);
          ErrorHandler.showNotification(error);
        });
    },
    [containerUuid, reload],
  );

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    noKeyboard: true,
    noClick: true,
  });

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token};
    setLoading(true);
    axios
      .get(`file-management/containers/${containerUuid}/view`, config)
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
  }, [containerUuid, reload]);

  const navigateToFolder = (container: Container) => {
    setSelectedFile(undefined);
    if (onChange) {
      onChange(container.uuid, container);
    }
  };

  const downloadFile = (file: File) => {
    axios
      .get(`file-management/files/${file.uuid}/download`)
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
  };

  const navigateToParent = () => {
    if (containerContent) {
      if (containerContent.container.parent_container) {
        navigateToFolder(containerContent.container.parent_container);
      }
    }
  };

  return (
    <div {...getRootProps()} className={'content-viewer-wrapper'}>
      <input {...getInputProps()} />
      {containerContent && (
        <>
          <ContainerHeader
            container={containerContent.container}
            upLevel={navigateToParent}
            onChange={() => setReload(!reload)}
            onOpenUpload={open}
            onChangeViewMode={mode => setViewMode(mode)}
            onToggleInformation={value => setShowFileInformation(value)}
          />
          <div className="file-navigator-wrapper">
            {isDragActive && <DropMessage />}
            {containerContent.containers.length === 0 && containerContent.files.length === 0 ? (
              <div style={{flex: 1}}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <>
                      <small>No hay archivos en esta ubicación</small> <br />
                      <strong>Haz clic en "Cargar archivos" o arrastra y suelta algunos aquí</strong> <br />
                      <br />
                      <Button
                        ghost
                        icon={<span className="button-icon icon-upload2" />}
                        onClick={open}
                        shape={'round'}
                        type={'primary'}
                        size={'small'}>
                        Cargar archivos
                      </Button>
                    </>
                  }
                />
              </div>
            ) : (
              <div className={`files-container mode-${viewMode}`}>
                <LoadingIndicator visible={loading} />
                {containerContent.containers.map(c => (
                  <FolderItem key={c.uuid} container={c} onDoubleClick={() => navigateToFolder(c)} />
                ))}
                {containerContent.files.map(file => (
                  <FileItem
                    key={file.uuid}
                    selected={selectedFile && file.uuid === selectedFile.uuid}
                    file={file}
                    onDoubleClick={() => downloadFile(file)}
                    onClick={() => setSelectedFile(file)}
                  />
                ))}
              </div>
            )}

            {showFileInformation && (
              <FileInformation
                file={selectedFile}
                onDelete={() => {
                  setSelectedFile(undefined);
                  setReload(!reload);
                }}
              />
            )}
          </div>
          <UploadInformation files={uploadingFiles} progress={loadingInformation} />
        </>
      )}
    </div>
  );
};

export default ContainerContentViewer;
