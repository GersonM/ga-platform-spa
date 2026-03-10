import React, {useEffect, useMemo, useState} from 'react';
import {TbPencil, TbTrash} from "react-icons/tb";
import axios from "axios";
import {Card, Empty, Popconfirm, Space, Spin} from "antd";

import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import CustomTag from "../../../CommonUI/CustomTag";
import ModalView from "../../../CommonUI/ModalView";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import CommercialProcessForm from "../../Components/CommercialProcessForm";
import IconButton from "../../../CommonUI/IconButton";
import type {CommercialProcess, CommercialProcessStage} from "../../../Types/api.tsx";

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const getNumber = (...values: Array<number | undefined>) => {
  for (const value of values) {
    if (typeof value === "number") {
      return value;
    }
  }
  return 0;
};

const normalizeStage = (stage: any, index: number): CommercialProcessStage => ({
  ...stage,
  uuid: stage?.uuid ?? `${index + 1}`,
  name: stage?.name ?? stage?.title ?? `Etapa ${index + 1}`,
  description: stage?.description ?? "",
  created_at: stage?.created_at ?? "",
});

const normalizeProcess = (process: any): CommercialProcess => {
  const rawStages = isArray(process?.stages)
    ? process.stages
    : isArray(process?.process_stages)
      ? process.process_stages
      : isArray(process?.steps)
        ? process.steps
        : [];

  return {
    ...process,
    uuid: process?.uuid ?? "",
    name: process?.name ?? "",
    description: process?.description ?? "",
    created_at: process?.created_at ?? "",
    stages: rawStages.map((stage: any, index: number) => normalizeStage(stage, index)),
  };
};

const getProcessStages = (process: CommercialProcess): CommercialProcessStage[] => {
  return isArray(process?.stages) ? process.stages : [];
};

const withProcessStages = (process: CommercialProcess, stages: CommercialProcessStage[]): CommercialProcess => ({
  ...process,
  stages,
});

const reorderStages = (stages: CommercialProcessStage[], fromIndex: number, toIndex: number): CommercialProcessStage[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= stages.length ||
    toIndex >= stages.length ||
    fromIndex === toIndex
  ) {
    return stages;
  }

  const cloned = [...stages];
  const [movedStage] = cloned.splice(fromIndex, 1);
  cloned.splice(toIndex, 0, movedStage);

  return cloned.map((stage, index) => ({...stage, order: index + 1} as CommercialProcessStage));
};

const ProcessesManagement = () => {
  const [openProcessForm, setOpenProcessForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [processes, setProcesses] = useState<CommercialProcess[]>([]);
  const [selectedProcessUuid, setSelectedProcessUuid] = useState<string>();
  const [selectedProcess, setSelectedProcess] = useState<CommercialProcess>();
  const [deletingUuid, setDeletingUuid] = useState<string>();
  const [dragStage, setDragStage] = useState<{ processUuid: string; index: number }>();
  const [reorderingUuid, setReorderingUuid] = useState<string>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get<{
        data?: CommercialProcess[];
      } | CommercialProcess[]>("commercial/processes", config)
      .then(response => {
        const payload = response.data;
        if (isArray(payload)) {
          setProcesses((payload as any[]).map(normalizeProcess));
          return;
        }

        const responseData = payload?.data;
        setProcesses(isArray(responseData) ? (responseData as any[]).map(normalizeProcess) : []);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const displayedProcesses = useMemo(() => {
    if (!selectedProcessUuid) {
      return processes;
    }
    return processes.filter(process => process.uuid === selectedProcessUuid);
  }, [processes, selectedProcessUuid]);

  const deleteProcess = (process: CommercialProcess) => {
    setDeletingUuid(process.uuid);

    axios
      .delete(`commercial/processes/${process.uuid}`)
      .then(() => {
        if (selectedProcessUuid === process.uuid) {
          setSelectedProcessUuid(undefined);
        }
        if (selectedProcess?.uuid === process.uuid) {
          setSelectedProcess(undefined);
        }
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setDeletingUuid(undefined);
      });
  };

  const persistStagesOrder = (process: CommercialProcess, stages: CommercialProcessStage[]) => {
    setReorderingUuid(process.uuid);

    axios
      .put(`commercial/processes/${process.uuid}`, {
        ...process,
        stages: stages.map((stage, index) => ({
          uuid: stage.uuid,
          name: stage.name,
          description: stage.description,
          order: (stage as any).order ?? index + 1,
        })),
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
        setReload(!reload);
      })
      .finally(() => {
        setReorderingUuid(undefined);
      });
  };

  const onDropStage = (process: CommercialProcess, targetIndex: number) => {
    if (!dragStage || dragStage.processUuid !== process.uuid) {
      return;
    }

    const stages = getProcessStages(process);
    const reordered = reorderStages(stages, dragStage.index, targetIndex);
    if (reordered === stages) {
      setDragStage(undefined);
      return;
    }

    setProcesses(prev =>
      prev.map(item => (item.uuid === process.uuid ? withProcessStages(item, reordered) : item))
    );

    persistStagesOrder(process, reordered);
    setDragStage(undefined);
  };

  return (
    <>
      <ModuleContent boxed>
        <ContentHeader
          title={'Procesos'}
          onRefresh={() => setReload(!reload)}
          onAdd={() => {
            setSelectedProcess(undefined);
            setOpenProcessForm(true);
          }}
        />
        <Spin spinning={loading || !!reorderingUuid}>
          {displayedProcesses.length === 0 && <Empty description={'No hay procesos disponibles'}/>}
          {displayedProcesses.map(process => {
            const stages = getProcessStages(process);

            return (
              <Card
                key={process.uuid}
                variant={'borderless'}
                title={<><CustomTag>Proceso</CustomTag> {process.name}</>}
                extra={
                  <Space>
                    <IconButton
                      small
                      title={'Editar proceso'}
                      icon={<TbPencil/>}
                      onClick={() => {
                        setSelectedProcess(process as CommercialProcess);
                        setOpenProcessForm(true);
                      }}
                    />
                    <Popconfirm
                      title={'Eliminar proceso'}
                      description={'Esta acción no se puede deshacer'}
                      okText={'Eliminar'}
                      cancelText={'Cancelar'}
                      onConfirm={() => deleteProcess(process)}
                    >
                      <IconButton
                        small
                        danger
                        title={'Eliminar proceso'}
                        loading={deletingUuid === process.uuid}
                        icon={<TbTrash/>}
                      />
                    </Popconfirm>
                  </Space>
                }
                size={"small"}
                style={{marginBottom: 20}}
              >
                {stages.length === 0 && <Empty description={'Este proceso no tiene etapas'}/>}
                <Space wrap>
                  {stages.map((stage, index) => (
                    <Card
                      key={stage.uuid ?? `${process.uuid}-${index}`}
                      draggable
                      onDragStart={() => setDragStage({processUuid: process.uuid, index})}
                      onDragOver={event => event.preventDefault()}
                      onDrop={() => onDropStage(process, index)}
                      style={{cursor: 'move'}}
                      size={"small"}
                      extra={<CustomTag>{index + 1}</CustomTag>}
                      title={stage.name ?? `Etapa ${index + 1}`}
                    >
                      {getNumber((stage as any).required_documents_count, (stage as any).documents_required)} documentos requeridos <br/>
                      {getNumber((stage as any).optional_documents_count, (stage as any).documents_optional)} documento opcional <br/>
                      {getNumber((stage as any).users_count, (stage as any).profiles_count)} usuarios en este proceso
                    </Card>
                  ))}
                </Space>
              </Card>
            );
          })}
        </Spin>
      </ModuleContent>
      <ModalView width={700} open={openProcessForm} onCancel={() => setOpenProcessForm(false)}>
        <CommercialProcessForm
          process={selectedProcess}
          onComplete={() => {
            setOpenProcessForm(false);
            setSelectedProcess(undefined);
            setReload(!reload);
          }}
        />
      </ModalView>
    </>
  );
};

export default ProcessesManagement;
