import axios from "axios";
import {useState} from 'react';
import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import type {ApiFile} from "../../Types/api.tsx";

const useGetApiFile = (onComplete?: (file: ApiFile) => void) => {
  const [loading, setLoading] = useState(false);
  const [fileInformation, setFileInformation] = useState<ApiFile>();

  const getApiFile = (fileUuid?: string) => {
    if(!fileUuid) return;
    setLoading(true);
    axios
      .post(`file-management/files/${fileUuid}`)
      .then(response => {
        if (response) {
          onComplete?.(response.data);
          setFileInformation(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        ErrorHandler.showNotification(error);
        setLoading(false);
      });
  };

  return {getApiFile, loading, fileInformation};
};

export default useGetApiFile;
