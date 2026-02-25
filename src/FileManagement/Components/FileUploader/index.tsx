import {useCallback, useContext, useEffect, useState} from 'react';
import {Progress} from 'antd';
import {ArrowUpTrayIcon} from '@heroicons/react/24/outline';
import {useDropzone} from 'react-dropzone';

import UploadContext from '../../../Context/UploadContext';
import './styles.less';
import type {ApiFile} from "../../../Types/api.tsx";

interface FileUploaderProps {
  showPreview?: boolean;
  imagePath?: string;
  showMessage?: boolean;
  fileUuid?: string;
  targetContainerUuid?: string;
  height?: number;
  maxWidth?: number;
  small?: boolean;
  clearOnFinish?: boolean;
  multiple?: boolean;
  onChange?: (uuid: string, fileUploaded: ApiFile) => void;
}

const FileUploader = (
  {
    height,
    maxWidth,
    onChange,
    multiple = false,
    small = false,
    targetContainerUuid,
    imagePath,
    showMessage = true,
    showPreview = false,
    clearOnFinish = true,
  }: FileUploaderProps) => {

  const [uploadedFile, setUploadedFile] = useState<any>();
  const [ownedFiles, setOwnedFiles] = useState<string[]>([]);
  const {addFile, lastFileCompleted, fileList} = useContext(UploadContext);

  useEffect(() => {
    if (lastFileCompleted && lastFileCompleted.fileData) {
      if (ownedFiles.includes(lastFileCompleted.id)) {
        setUploadedFile(clearOnFinish ? undefined : lastFileCompleted.fileData);
        if (onChange) {
          onChange(lastFileCompleted.fileData?.uuid, lastFileCompleted.fileData);
        }
      }
    }
  }, [lastFileCompleted]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const acceptedFilesKey in acceptedFiles) {
      const fileId = addFile(acceptedFiles[acceptedFilesKey], targetContainerUuid);
      setOwnedFiles(prev => [...prev, fileId]);
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, noDragEventsBubbling: true, multiple});

  const ownedFilesFilter = fileList
    ?.filter(f => ownedFiles.includes(f.id)) || [];

  return (
    <>
      <div {...getRootProps()} className={`file-uploader-wrapper ${small ? 'small' : ''}`} style={{height, maxWidth}}>
        <input {...getInputProps()} />
        {ownedFilesFilter?.map((item, index) => (
          <div key={index}>
            {showPreview && item.file.name}
            <Progress type={small?'circle':'line'} percent={item.progress} size={25} strokeWidth={small ? 8 : undefined}/>
          </div>
        ))}
        {(isDragActive || ownedFilesFilter.length == 0) && (
          <div className={'content-label'}>
            <ArrowUpTrayIcon width={small ? 18 : 24}/>
            {(showMessage|| isDragActive) && (isDragActive ? 'Suelta tus archivos aquí' : 'Arrastra archivos aquí')}
          </div>
        )}
        {showPreview && uploadedFile && (
          <div className={'preview'} style={{backgroundImage: 'url(' + uploadedFile.thumbnail + ')'}}/>
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
