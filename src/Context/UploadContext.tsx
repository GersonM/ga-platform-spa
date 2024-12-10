import React, {createContext, useState} from 'react';
import axios from 'axios';
import {message} from 'antd';
import {sha256} from 'js-sha256';

import {File as ApiFile, TenantConfig} from '../Types/api';
import ErrorHandler from '../Utils/ErrorHandler';

interface UploadContextDefaults {
  config?: TenantConfig;
  openMenu: boolean;
  uploadProgress?: any;
  addFile: (file: File) => void;
  setOpenMenu: (value: boolean) => void;
}

interface UploadContextProp {
  children?: React.ReactNode;
  config?: TenantConfig;
}

const UploadContext = createContext<UploadContextDefaults>({
  openMenu: false,
  setOpenMenu(): void {},
  addFile(): void {},
});

const UploadContextProvider = ({children, config}: UploadContextProp) => {
  const [uploadingFileList, setUploadingFileList] = useState<File[]>();
  const [openMenu, setOpenMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
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
      setLoading(false);
      message.success('Archivo cargado!');
    } catch (error) {
      setLoading(false);
      ErrorHandler.showNotification(error, 5);
    }
  };

  const handleFileUpdate = async (file: File, fileUuid: string) => {
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

  const uploadFile = async (file: File, uuid?: string) => {
    if (uuid) {
      handleFileUpdate(file, uuid);
    } else {
      handleFileUpload(file);
    }
  };

  const addFile = async (file: File, data?: any) => {
    const hash = sha256(file.name + '' + file.size + '' + file.lastModified + '' + file.webkitRelativePath);
    const chunkSize = 2 * 1024 * 1024; // 5MB (adjust based on your requirements)
    const totalChunks = Math.ceil(file.size / chunkSize);
    console.log(hash, totalChunks);

    try {
      const savedQueue = localStorage.getItem('uploadQueue');
      const queue: any[] = savedQueue ? JSON.parse(savedQueue) : [];
      queue.push({hash, chunkSize, totalChunks});
      localStorage.setItem('uploadQueue', JSON.stringify(queue));
    } catch (error) {
      ErrorHandler.showNotification(error, 5);
    }
  };

  /*const uploadNextChunk = async () => {
    if (end <= selectedFile.size) {
      const chunk = selectedFile.slice(start, end);
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('chunkNumber', chunkNumber);
      formData.append('totalChunks', totalChunks);
      formData.append('originalname', selectedFile.name);

      fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log({data});
          const temp = `Chunk ${chunkNumber + 1}/${totalChunks} uploaded successfully`;
          setStatus(temp);
          setProgress(Number((chunkNumber + 1) * chunkProgress));
          console.log(temp);
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
      setSelectedFile(null);
      setStatus('File upload completed');
    }
  };*/

  return (
    <UploadContext.Provider
      value={{
        config,
        openMenu,
        setOpenMenu,
        uploadProgress,
        addFile,
      }}>
      {children}
    </UploadContext.Provider>
  );
};

export {UploadContextProvider};
export default UploadContext;
