import React, {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Button, Empty} from 'antd';
import axios, {AxiosProgressEvent} from 'axios';

import FileItem from './FileItem';
import FolderItem from './FolderItem';
import FileInformation from '../FileInformation';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import {Container, ContainerContent, ApiFile} from '../../../Types/api';
import ContainerHeader from '../../Screens/CompanyContainers/ContainerHeader';
import UploadInformation from '../UploadInformation';
import DropMessage from './DropMessage';
import {CloudArrowUpIcon} from '@heroicons/react/24/solid';
import './styles.less';

interface ContainerContentViewerProps {
  containerUuid: string;
  onChange?: (containerUuid: string, container: Container) => void;
}

const ContainerContentViewer = ({onChange, containerUuid}: ContainerContentViewerProps) => {
  const [containerContent, setContainerContent] = useState<ContainerContent>();
  const [selectedFile, setSelectedFile] = useState<ApiFile>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [showFileInformation, setShowFileInformation] = useState<boolean>();
  const [viewMode, setViewMode] = useState<string | number>();
  const [orderBy, setOrderBy] = useState('name');
  const [loadingInformation, setLoadingInformation] = useState<AxiosProgressEvent>();
  const [selectedFiles, setSelectedFiles] = useState<Array<any>>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedFiles) {
      const current = selectedFiles[0];
    }
  }, [selectedFiles]);

  const uploadFile = (file: any) => {
    handleFileUpload(file);
  };

  const handleFileUpload = (selectedFile: any) => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const chunkSize = 10 * 1024 * 1024; // 5MB (adjust based on your requirements)
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    const chunkProgress = 100 / totalChunks;
    let chunkNumber = 0;
    let start = 0;
    let end = 0;

    const uploadNextChunk = async () => {
      if (end <= selectedFile.size) {
        const chunk = selectedFile.slice(start, end);
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkNumber', chunkNumber.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('originalname', selectedFile.name);
        formData.append('container_uuid', containerUuid);

        const config = {
          onUploadProgress: (r: AxiosProgressEvent) => {
            setLoadingInformation(r);
          },
          baseURL: import.meta.env.VITE_API_UPLOAD,
        };
        axios
          .post('file-management/chunked-files', formData, config)

          /*fetch(import.meta.env.VITE_API_UPLOAD + 'file-management/chunked-files', {
                            method: 'POST',
                            body: formData,
                            headers: {
                              'X-Tenant': 'app',
                              Authorization: 'Bearer ' + axios.defaults.headers.common.Authorization,
                            },
                          })*/
          //.then(response => response.json())
          .then(data => {
            const temp = `Chunk ${chunkNumber + 1}/${totalChunks} uploaded successfully`;
            //setStatus(temp);
            setProgress(Number((chunkNumber + 1) * chunkProgress));
            chunkNumber++;
            start = end;
            end = start + chunkSize;
            uploadNextChunk();
          })
          .catch(error => {
            console.error('Error uploading chunk:', error);
          });
      } else {
        setProgress(100);
        setSelectedFile(undefined);
        //setStatus('File upload completed');
      }
    };

    uploadNextChunk().then();
  };

  const onDrop = useCallback(
    (acceptedFiles: Array<Blob>) => {
      setSelectedFiles(acceptedFiles);
      //uploadFile(acceptedFiles[0]);
      //return;
      const formData = new FormData();
      acceptedFiles.forEach(item => {
        formData.append('file[]', item);
      });
      formData.append('container_uuid', containerUuid);
      const config = {
        onUploadProgress: (r: AxiosProgressEvent) => {
          setLoadingInformation(r);
        },
        baseURL: import.meta.env.VITE_API_UPLOAD,
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

  useEffect(() => {
    setSelectedFile(undefined);
  }, [containerUuid]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        order_by: orderBy,
      },
    };
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
  }, [containerUuid, reload, orderBy]);

  const navigateToFolder = (container: Container) => {
    setSelectedFile(undefined);
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
      if (containerContent.container.parent_container) {
        navigateToFolder(containerContent.container.parent_container);
      }
    }
  };

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    noKeyboard: true,
    noClick: true,
  });

  return (
    <div {...getRootProps()} className={'content-viewer-wrapper'}>
      <iframe id="my_iframe" style={{display: 'none'}}></iframe>
      <input {...getInputProps()} />
      {containerContent && (
        <>
          <ContainerHeader
            container={containerContent.container}
            upLevel={navigateToParent}
            onChange={() => setReload(!reload)}
            onReload={() => setReload(!reload)}
            onChangeOrder={order => setOrderBy(order)}
            onOpenUpload={open}
            onChangeViewMode={mode => setViewMode(mode)}
            onToggleInformation={value => setShowFileInformation(value)}
          />
          <div className="file-navigator-wrapper">
            {isDragActive && <DropMessage />}
            {showFileInformation && (
              <FileInformation
                fileContainer={containerContent.container}
                file={selectedFile}
                onChange={() => {
                  //  setSelectedFile(undefined);
                  //TODO: Check if the selected file exist
                  setReload(!reload);
                }}
              />
            )}
            {containerContent.containers.length === 0 && containerContent.files.length === 0 ? (
              <div style={{flex: 1}}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <>
                      <small>No hay archivos en esta ubicación</small> <br />
                      <strong>Haz clic en "Cargar archivos" o arrastra y suelta algunos aquí</strong> <br />
                      <br />
                      <Button ghost icon={<CloudArrowUpIcon />} onClick={open} shape={'round'} type={'primary'}>
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
                  <FolderItem
                    key={c.uuid}
                    container={c}
                    onDoubleClick={() => navigateToFolder(c)}
                    onChange={() => setReload(!reload)}
                  />
                ))}
                {containerContent.files.map(file => (
                  <FileItem
                    size={viewMode == 'grid' ? 45 : 24}
                    key={file.uuid}
                    selected={selectedFile && file.uuid === selectedFile.uuid}
                    file={file}
                    onChange={() => setReload(!reload)}
                    onDoubleClick={() => downloadFile(file)}
                    onClick={() => setSelectedFile(file)}
                  />
                ))}
              </div>
            )}
          </div>
          <UploadInformation files={selectedFiles} progress={loadingInformation} />
        </>
      )}
    </div>
  );
};

export default ContainerContentViewer;
