import React, {useCallback, useContext, useState} from 'react';
import {message, Progress} from 'antd';
import axios from 'axios';
import {ArrowUpTrayIcon, PaperClipIcon} from '@heroicons/react/24/outline';
import {useDropzone} from 'react-dropzone';

import UploadContext from '../../../Context/UploadContext';
import IconButton from '../../../CommonUI/IconButton';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface FileUploaderProps {
  onFilesUploaded?: (file: any) => void;
  showPreview?: boolean;
  imagePath?: string;
  fileUuid?: string;
  height?: number;
  onChange?: (uuid: string) => void;
}

const FileUploader = ({
  height,
  onChange,
  onFilesUploaded,
  imagePath,
  fileUuid,
  showPreview = false,
}: FileUploaderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>();
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<any>();
  const {addFile} = useContext(UploadContext);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_name', '');
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
      onFilesUploaded && onFilesUploaded(response.data);
      onChange && onChange(response.data.uuid);

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

      const response = await axios.post(`file-management/files/${fileUuid}`, formData, {
        onUploadProgress: progressEvent => {
          const total = progressEvent.total || 0;
          const percentCompleted = Math.floor((progressEvent.loaded / total) * 100);
          setProgress(percentCompleted);
        },
      });

      //setUploadedFile(response.data);
      //onFilesUploaded && onFilesUploaded(response.data);

      setLoading(false);
      message.success('Archivo cargado!');
    } catch (error) {
      setLoading(false);
      ErrorHandler.showNotification(error, 5);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const acceptedFilesKey in acceptedFiles) {
      addFile(acceptedFiles[acceptedFilesKey]);
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
                  <IconButton icon={<PaperClipIcon />} />
                  {f.name}
                </div>
              );
            })}
          </span>
        )}
        {loading && <Progress percent={progress} size={'small'} />}
        {(isDragActive || !files) && (
          <div className={'content-label'}>
            <ArrowUpTrayIcon width={25} />
            {isDragActive ? <>Suelta tus archivos aquí</> : <>Arrastra archivos aquí</>}
          </div>
        )}
        {showPreview && uploadedFile && (
          <div className={'preview'} style={{backgroundImage: 'url(' + uploadedFile.source + ')'}} />
        )}
        {showPreview && imagePath && (
          <>
            <div className={'preview'} style={{backgroundImage: 'url(' + imagePath + ')'}} />
          </>
        )}
      </div>
    </>
  );
};

export default FileUploader;
