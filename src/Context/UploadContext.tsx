import React, {createContext, useEffect, useState} from 'react';
import axios, {AxiosProgressEvent} from 'axios';
import {message} from 'antd';
import {sha256} from 'js-sha256';

import {ApiFile as ApiFile, UploadQueueFile} from '../Types/api';
import ErrorHandler from '../Utils/ErrorHandler';

interface UploadContextDefaults {
  fileList?: any[];
  addFile: (file: File) => void;
}

interface UploadContextProp {
  children?: React.ReactNode;
}

const UploadContext = createContext<UploadContextDefaults>({
  addFile(): void {},
});

const chunkSize = 2 * 1024 * 1024; // 5MB (adjust based on your requirements)

const UploadContextProvider = ({children}: UploadContextProp) => {
  const [fileList, setFileList] = useState<any[]>();
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<ApiFile>();
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<UploadQueueFile>();

  useEffect(() => {
    uploadNextFile();
  }, [fileList]);

  useEffect(() => {
    // Function to upload a chunk of the file
    async function uploadChunk(data: any) {
      if (!currentFile) return;

      let formData = new FormData();
      formData.append('file', data, `chunk-${currentChunkIndex}`);
      formData.set('name', currentFile.file.name);
      formData.set('currentChunkIndex', currentChunkIndex.toString());
      formData.set('totalChunks', Math.ceil(currentFile.file.size / chunkSize).toString());

      const config = {
        onUploadProgress: (r: AxiosProgressEvent) => {
          //setLoadingInformation(r);
          console.log(r.progress);
        },
        baseURL: import.meta.env.VITE_API_UPLOAD,
        body: data,
      };
      let uploadPromise = await axios.post('file-management/chunked-files', formData, config);
      // Make the POST request to the server
      const isLastChunk = currentChunkIndex === Math.ceil(currentFile.file.size / chunkSize) - 1;
      // If it is, set the final filename and reset the current chunk index
      if (isLastChunk) {
        //currentFile.file.finalFilename = uploadPromise.data;
        setCurrentChunkIndex(0);
      } else {
        // If it's not, increment the current chunk index
        setCurrentChunkIndex(currentChunkIndex + 1);
      }
    }

    // Function to read and upload the current chunk
    function readAndUploadCurrentChunk() {
      if (!currentFile) return;
      const from = currentChunkIndex * chunkSize;
      const to =
        (currentChunkIndex + 1) * chunkSize >= currentFile.file.size ? currentFile.file.size : from + chunkSize;

      const blob = currentFile.file.slice(from, to);
      uploadChunk(blob).then();
    }

    // If a chunk index is set, read and upload the current chunk
    if (currentChunkIndex != null) readAndUploadCurrentChunk();
  }, [chunkSize, currentChunkIndex, currentFile]);

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

  const addFile = (file: File, data?: any) => {
    const hash = sha256(file.name + '' + file.size + '' + file.lastModified + '' + file.webkitRelativePath);
    const totalChunks = Math.ceil(file.size / chunkSize);

    setFileList(value => {
      const q: any[] = value ? [...value] : [];
      q.push({hash, chunkSize, totalChunks, file, data, progress: 0});
      return q;
    });
  };

  const uploadNextFile = () => {
    if (isUploading || !fileList || fileList?.length === 0) {
      return;
    }

    console.log('Starting upload...');
    setIsUploading(true);
    setCurrentFile(fileList[0]);
  };

  console.log({fileList});

  return (
    <UploadContext.Provider
      value={{
        fileList,
        addFile,
      }}>
      {children}
    </UploadContext.Provider>
  );
};

export {UploadContextProvider};
export default UploadContext;
