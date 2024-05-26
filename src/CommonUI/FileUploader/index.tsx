import {useCallback, useState} from 'react';
import {message, Progress} from 'antd';
import axios from 'axios';
import {ArrowUpTrayIcon, PaperClipIcon} from '@heroicons/react/24/outline';
import {useDropzone} from 'react-dropzone';

import './styles.less';
import IconButton from '../IconButton';
import {File as ApiFile} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';

interface FileUploaderProps {
  onFilesUploaded?: (file: ApiFile) => void;
  showPreview?: boolean;
  imagePath?: string;
}

const FileUploader = ({onFilesUploaded, imagePath, showPreview = false}: FileUploaderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [files, setFiles] = useState<File[]>();
  const [uploadedFile, setUploadedFile] = useState<ApiFile>();

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

      setLoading(false);
      message.success('File uploaded successfully!');
    } catch (error) {
      setLoading(false);
      ErrorHandler.showNotification(error, 5);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      message.warning({content: 'Choose only one file'}).then();
      return;
    }
    setFiles(acceptedFiles);
    handleFileUpload(acceptedFiles[0]).then();
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <>
      <div {...getRootProps()} className={`file-uploader-wrapper`}>
        {showPreview && uploadedFile && (
          <div className={'preview'} style={{backgroundImage: 'url(' + uploadedFile.source + ')'}} />
        )}
        {showPreview && imagePath && <div className={'preview'} style={{backgroundImage: 'url(' + imagePath + ')'}} />}
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
        {(isDragActive || (!files && !imagePath)) && (
          <div className={'content-label'}>
            <ArrowUpTrayIcon width={25} />
            {isDragActive ? <>Drop the files here</> : <>Drag & drop</>}
          </div>
        )}
      </div>
    </>
  );
};

export default FileUploader;
