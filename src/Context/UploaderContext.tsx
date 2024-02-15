import React, {createContext, useContext, useEffect, useState} from 'react';
import AuthContext from './AuthContext';
import UploadManager from '../FileManagement/Components/UploadManager';
import md5 from 'md5';
import {UploadQueueItem} from '../Types/api';

interface UploaderContextDefaults {
  addFiles: (files: File[]) => void;
  queue?: UploadQueueItem[];
}

interface UploaderContextProps {
  children: React.ReactNode;
}

const UploaderContext = createContext<UploaderContextDefaults>({
  addFiles(): void {},
});

const UploaderContextProvider = ({children}: UploaderContextProps) => {
  const {user} = useContext(AuthContext);
  const [queue, setQueue] = useState<UploadQueueItem[]>();

  useEffect(() => {}, []);

  const addFiles = (files: File[]) => {
    let newQueue: UploadQueueItem[] = !queue ? [] : [...queue];
    console.log('current queue', newQueue.length);
    for (let f of files) {
      const hash = md5(f.name + f.lastModified);
      console.log(f.name);
      if (!queue?.find(q => q.hash === hash)) {
        newQueue.push({hash, file: f});
        console.log('adding: ', hash);
      } else {
        console.warn('exists', hash);
      }
    }
    console.log({newQueue});
    setQueue(state => {
      return newQueue;
    });
  };

  return (
    <UploaderContext.Provider
      value={{
        addFiles,
        queue,
      }}>
      {children}
      <UploadManager files={queue} />
    </UploaderContext.Provider>
  );
};

export {UploaderContextProvider};
export default UploaderContext;
