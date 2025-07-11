import {createContext, useEffect, useState} from 'react';
import axios, {type AxiosProgressEvent} from 'axios';
import {sha256} from 'js-sha256';

import type {UploadQueueFile} from '../Types/api';

interface UploadContextDefaults {
  fileList?: UploadQueueFile[];
  isUploading: boolean;
  addFile: (file: File, containerUuid?: string) => string;
  lastFileCompleted?: UploadQueueFile;
  progress: any;
}

interface UploadContextProp {
  children?: React.ReactNode;
}

const UploadContext = createContext<UploadContextDefaults>({
  addFile(): string {
    return '';
  },
  progress: {},
  isUploading: false,
});

const chunkSize = 10 * 1024 * 1024; // 5MB (adjust based on your requirements)

const UploadContextProvider = ({children}: UploadContextProp) => {
  const [fileList, setFileList] = useState<UploadQueueFile[]>();
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<UploadQueueFile>();
  const [lastFileCompleted, setLastFileCompleted] = useState<UploadQueueFile>();
  const [progress, setProgress] = useState<any>();

  useEffect(() => {
    if (!isUploading) {
      uploadNextFile();
    }
  }, [fileList, isUploading]);

  useEffect(() => {
    async function uploadChunk(data: any) {
      if (!currentFile) return;

      const totalChunks = Math.ceil(currentFile.file.size / chunkSize);
      const isLastChunk = currentChunkIndex === totalChunks - 1;
      const fileProgress = currentChunkIndex / totalChunks;

      const formData = new FormData();
      formData.append('file', data, `chunk-${currentChunkIndex}`);
      formData.set('name', currentFile.file.name);
      formData.set('hash', currentFile.hash);
      formData.set('current_chunk', currentChunkIndex.toString());
      formData.set('total_chunks', totalChunks.toString());
      if (currentFile.containerUuid) {
        formData.set('container_uuid', currentFile.containerUuid);
      }

      const config = {
        onUploadProgress: (r: AxiosProgressEvent) => {
          if (r.progress) {
            setProgress({
              timestamp: new Date().getTime(),
              percent: fileProgress + (r.progress / totalChunks),
              hash: currentFile.hash,
            });
          }
        },
        baseURL: import.meta.env.VITE_API_UPLOAD,
        body: data,
      };
      const response = await axios.post('file-management/chunked-files', formData, config);

      setFileList(copy => {
        if (copy && currentFile) {
          const i = copy.findIndex(f => f.id === currentFile.id);
          copy[i].progress = fileProgress;
          return copy;
        }
      });

      if (currentChunkIndex == 0 && response.data.next_chunk) {
        console.log('Next chunk to resume: ', response.data.next_chunk);
        setCurrentChunkIndex(response.data.next_chunk);
      }

      if (isLastChunk) {
        setFileList(copy => {
          if (copy && currentFile) {
            const i = copy.findIndex(f => f.id === currentFile.id);
            copy[i].progress = 100;
            copy[i].fileData = response.data;
            return copy;
          }
        });
        setLastFileCompleted(currentFile);
        setIsUploading(false);
      }

      if (currentChunkIndex != 0 && !isLastChunk) {
        setCurrentChunkIndex(currentChunkIndex + 1);
      }
    }

    function readAndUploadCurrentChunk() {
      if (!currentFile) return;
      const from = currentChunkIndex * chunkSize;
      const to =
        (currentChunkIndex + 1) * chunkSize >= currentFile.file.size ? currentFile.file.size : from + chunkSize;

      const blob = currentFile.file.slice(from, to);
      uploadChunk(blob).then();
    }

    if (currentChunkIndex != null) readAndUploadCurrentChunk();
  }, [currentChunkIndex, currentFile]);

  const addFile = (file: File, containerUuid?: string): string => {
    const hash = sha256(file.name + '' + file.size + '' + file.lastModified + '' + file.webkitRelativePath);
    const id = sha256(Math.random().toString());
    const totalChunks = Math.ceil(file.size / chunkSize);

    setFileList(value => {
      const q: any[] = value ? [...value] : [];
      q.push({id, hash, chunkSize, totalChunks, file, containerUuid, progress: 0});
      return q;
    });

    return id;
  };

  const uploadNextFile = () => {
    const nextFile = fileList?.find(f => !f.fileData);
    if (nextFile) {
      setIsUploading(true);
      setCurrentChunkIndex(0);
      setCurrentFile(nextFile);
    } else {
      setIsUploading(false);
    }
  };

  return (
    <UploadContext.Provider
      value={{
        fileList,
        addFile,
        isUploading,
        lastFileCompleted,
        progress
      }}>
      {children}
    </UploadContext.Provider>
  );
};

export {UploadContextProvider};
export default UploadContext;
