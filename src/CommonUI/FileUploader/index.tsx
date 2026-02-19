import {useCallback, useState} from 'react';
import {message, Progress} from 'antd';
import axios from 'axios';
import {ArrowUpTrayIcon, PaperClipIcon} from '@heroicons/react/24/outline';
import {useDropzone} from 'react-dropzone';

import IconButton from '../IconButton';
import type {ApiFile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';
import './styles.less';

interface FileUploaderProps {
  onFilesUploaded?: (file: ApiFile) => void;
  showPreview?: boolean;
  imagePath?: string;
  fileUuid?: string;
  metadataExtract?: 'financial';
  height?: number;
  onChange?: (uuid: string) => void;
}

const FileUploader = (
  {
    height,
    onChange,
    onFilesUploaded,
    imagePath,
    fileUuid,
    metadataExtract,
    showPreview = false,
  }: FileUploaderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>();
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<ApiFile>();

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_name', '');
    if (metadataExtract) {
      formData.append('metadata_extract', metadataExtract);
    }
    formData.append('document_type_id', '');
    formData.append('file_type', '');

    try {
      setLoading(true);

      const response = await axios.post(`file-management/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          const total = progressEvent.total || 0;
          const percentCompleted = Math.floor((progressEvent.loaded / total) * 100);
          setProgress(percentCompleted);
        },
      });

      setUploadedFile(response.data);
      if (onFilesUploaded) onFilesUploaded(response.data);
      if (onChange) onChange(response.data.uuid);

      setLoading(false);
      message.success('Archivo cargado!');
    } catch (error) {
      setLoading(false);
      ErrorHandler.showNotification(error, 5);
    }
  };

  const handleFileUpdate = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);

      const _response = await axios.post(`file-management/files/${fileUuid}`, formData, {
        onUploadProgress: progressEvent => {
          const total = progressEvent.total || 0;
          const percentCompleted = Math.floor((progressEvent.loaded / total) * 100);
          setProgress(percentCompleted);
        },
      });

      setLoading(false);
      message.success('Archivo cargado!');
    } catch (error) {
      setLoading(false);
      ErrorHandler.showNotification(error, 5);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      message.warning({content: 'Seleccionar solo un archivo'}).then();
      return;
    }
    setFiles(acceptedFiles);
    if (fileUuid) {
      handleFileUpdate(acceptedFiles[0]).then();
    } else {
      handleFileUpload(acceptedFiles[0]).then();
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, noDragEventsBubbling: true});

  return (
    <>
      <div {...getRootProps()} className={`file-uploader-wrapper`} style={{height}}>
        <input {...getInputProps()} />
        {files && (
          <span className={'file-name'}>
            {files.map((f, index) => {
              return (
                <div key={index}>
                  <IconButton icon={<PaperClipIcon/>}/>
                  {f.name}
                </div>
              );
            })}
          </span>
        )}
        {loading && <Progress percent={progress} size={'small'}/>}
        {(isDragActive || !files) && (
          <div className={'content-label'}>
            <ArrowUpTrayIcon width={25}/>
            {isDragActive ? <>Suelta tus archivos aquí</> : <>Arrastra archivos aquí</>}
          </div>
        )}
        {showPreview && uploadedFile && (
          <div className={'preview'} style={{backgroundImage: 'url(' + uploadedFile.source + ')'}}/>
        )}
        {showPreview && imagePath && (
          <>
            <div className={'preview'} style={{backgroundImage: 'url(' + imagePath + ')'}}/>
          </>
        )}
      </div>
    </>
  );
};

export default FileUploader;
