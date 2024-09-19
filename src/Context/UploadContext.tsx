import React, {createContext, useState} from 'react';
import axios from 'axios';
import {message} from 'antd';

import {File as ApiFile, TenantConfig} from '../Types/api';
import ErrorHandler from '../Utils/ErrorHandler';

interface UploadContextDefaults {
  config?: TenantConfig;
  openMenu: boolean;
  uploadProgress?: any;
  setOpenMenu: (value: boolean) => void;
}

interface UploadContextProp {
  children?: React.ReactNode;
  config?: TenantConfig;
}

const UploadContext = createContext<UploadContextDefaults>({
  openMenu: false,
  setOpenMenu(): void {},
});

const UploadContextProvider = ({children, config}: UploadContextProp) => {
  const [uploadingFileList, setUploadingFileList] = useState();
  const [darkMode, setDarkMode] = useState<boolean>();
  const [openMenu, setOpenMenu] = useState(false);
  const [preferredMode, setPreferredMode] = useState<string>('auto');
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

  return (
    <UploadContext.Provider
      value={{
        config,
        openMenu,
        setOpenMenu,
        uploadProgress,
      }}>
      {children}
    </UploadContext.Provider>
  );
};

export {UploadContextProvider};
export default UploadContext;
