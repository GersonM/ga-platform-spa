import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Progress} from 'antd';
import {ArrowUpTrayIcon, PaperClipIcon} from '@heroicons/react/24/outline';
import {useDropzone} from 'react-dropzone';

import UploadContext from '../../../Context/UploadContext';
import IconButton from '../../../CommonUI/IconButton';
import FileSize from '../../../CommonUI/FileSize';
import './styles.less';

interface FileUploaderProps {
  onFilesUploaded?: (file: any) => void;
  showPreview?: boolean;
  imagePath?: string;
  fileUuid?: string;
  height?: number;
  multiple?: boolean;
  onChange?: (uuid: string) => void;
}

const FileUploader = ({
  height,
  onChange,
  onFilesUploaded,
  multiple = false,
  imagePath,
  fileUuid,
  showPreview = false,
}: FileUploaderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>();
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<any>();
  const [ownedFiles, setOwnedFiles] = useState<string[]>([]);
  const {addFile, lastFileCompleted, fileList} = useContext(UploadContext);

  useEffect(() => {
    if (lastFileCompleted && lastFileCompleted.fileData) {
      if (ownedFiles.includes(lastFileCompleted.id)) {
        setUploadedFile(lastFileCompleted.fileData);
        onChange && onChange(lastFileCompleted.fileData?.uuid);
      }
    }
  }, [lastFileCompleted]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const acceptedFilesKey in acceptedFiles) {
      const fileId = addFile(acceptedFiles[acceptedFilesKey]);
      setOwnedFiles(prev => [...prev, fileId]);
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, noDragEventsBubbling: true, multiple});

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
        {fileList
          ?.filter(f => ownedFiles.includes(f.id))
          .map((item, index) => (
            <li key={index}>
              {item.file.name} - <FileSize size={item.file.size} />
              <Progress percent={item.progress} size={'small'} />
            </li>
          ))}

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
