import {useCallback, useContext, useEffect, useState} from 'react';
import {Progress} from 'antd';
import {ArrowUpTrayIcon} from '@heroicons/react/24/outline';
import {useDropzone} from 'react-dropzone';

import UploadContext from '../../../Context/UploadContext';
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
                        multiple = false,
                        imagePath,
                        showPreview = false,
                      }: FileUploaderProps) => {

  const [uploadedFile, setUploadedFile] = useState<any>();
  const [ownedFiles, setOwnedFiles] = useState<string[]>([]);
  const {addFile, lastFileCompleted, fileList} = useContext(UploadContext);

  useEffect(() => {
    console.log('updated file list: ');
  }, [fileList]);

  useEffect(() => {
    if (lastFileCompleted && lastFileCompleted.fileData) {
      if (ownedFiles.includes(lastFileCompleted.id)) {
        setUploadedFile(lastFileCompleted.fileData);
        if (onChange) {
          onChange(lastFileCompleted.fileData?.uuid);
        }
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

  const ownedFilesFilter = fileList
    ?.filter(f => ownedFiles.includes(f.id)) || [];

  return (
    <>
      <div {...getRootProps()} className={`file-uploader-wrapper`} style={{height}}>
        <input {...getInputProps()} />
        {ownedFilesFilter?.map((item, index) => (
            <li key={index}>
              {item.file.name} - <FileSize size={item.file.size}/>
              <Progress percent={item.progress} size={'small'}/>
            </li>
          ))}

        {(isDragActive || ownedFilesFilter.length == 0) && (
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
