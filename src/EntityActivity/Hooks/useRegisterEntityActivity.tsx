import {useState} from 'react';
import axios from "axios";
import Config from "../../Config.tsx";
import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import type {Dayjs} from "dayjs";
import type {ApiFile} from "../../Types/api.tsx";

const useRegisterEntityActivity = (onComplete?: () => void) => {
  const [loading, setLoading] = useState(false);

  const registerActivity = (
    entityUuid: string, entityType:string, message: string, type?: string, expirationDate?: Dayjs,
    files?: ApiFile[],
    messageAssignedTo?: string,
  ) => {
    setLoading(true);
    axios
      .post(`entity-activity`, {
        uuid: entityUuid,
        entity_type: entityType,
        message,
        expired_at: expirationDate?.format(Config.dateFormatServer),
        type,
        assigned_uuid: messageAssignedTo,
        files: files?.map(f => f.uuid),
      })
      .then(() => {
        onComplete?.();
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return {registerActivity, loading};
};

export default useRegisterEntityActivity;
