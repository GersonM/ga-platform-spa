import {useEffect, useState} from "react";
import axios from "axios";

import type {CommercialProcess, CommercialProcessStage} from "../../Types/api.tsx";
import ErrorHandler from "../../Utils/ErrorHandler.tsx";

interface UseGetProcessStagesReturn {
  stages: CommercialProcessStage[];
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const getStagesFromProcess = (process?: CommercialProcess | any): CommercialProcessStage[] => {
  if (!process) {
    return [];
  }
  if (isArray(process.stages)) {
    return process.stages as CommercialProcessStage[];
  }
  if (isArray(process.process_stages)) {
    return process.process_stages as CommercialProcessStage[];
  }
  if (isArray(process.steps)) {
    return process.steps as CommercialProcessStage[];
  }
  return [];
};

const useGetProcessStages = (processUuid?: string): UseGetProcessStagesReturn => {
  const [stages, setStages] = useState<CommercialProcessStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getData = async () => {
    if (!processUuid) {
      setStages([]);
      return;
    }

    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    setError(false);

    try {
      const response = await axios.get<{data?: CommercialProcessStage[]} | CommercialProcessStage[]>(
        `commercial/processes/${processUuid}/stages`,
        config
      );
      const payload = response.data;
      if (isArray(payload)) {
        setStages(payload as CommercialProcessStage[]);
      } else {
        setStages(isArray(payload?.data) ? (payload.data as CommercialProcessStage[]) : []);
      }
    } catch (requestError: any) {
      // Fallback: algunos entornos retornan las etapas en el endpoint del proceso.
      if (requestError?.response?.status === 404) {
        try {
          const fallbackResponse = await axios.get<{data?: CommercialProcess} | CommercialProcess>(
            `commercial/processes/${processUuid}`,
            config
          );
          const fallbackPayload = fallbackResponse.data;
          if (isArray(fallbackPayload)) {
            setStages([]);
          } else {
            const process = (fallbackPayload as any)?.data ?? fallbackPayload;
            setStages(getStagesFromProcess(process));
          }
          return;
        } catch (fallbackError) {
          setError(true);
          ErrorHandler.showNotification(fallbackError);
          return;
        }
      }

      setError(true);
      ErrorHandler.showNotification(requestError);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    if (!processUuid) {
      setStages([]);
      return;
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processUuid]);

  return {stages, loading, error, refetch: getData};
};

export default useGetProcessStages;
