import {useEffect, useState} from 'react';
import {PlusIcon, TrashIcon} from '@heroicons/react/24/solid';
import {Collapse, Empty, List, Modal, Popconfirm, Space} from 'antd';
import axios from 'axios';

import type {CourseModule} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ModuleSessionForm from '../ModuleSessionForm';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface CourseModulesManagerProps {
  courseUUID: string;
  refresh?: boolean;
}

const CourseModulesManager = ({refresh, courseUUID}: CourseModulesManagerProps) => {
  const [_loading, setLoading] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>();
  const [openSessionForm, setOpenSessionForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get(`lms/courses/${courseUUID}/modules`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setModules(response.data);
        }
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [courseUUID, refresh, reload]);

  const deleteModule = (uuid: string) => {
    axios
      .delete(`/lms/modules/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const deleteSession = (uuid: string) => {
    axios
      .delete(`/lms/sessions/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <div>
      <Collapse size={'small'}>
        {modules?.map((module, _index) => (
          <Collapse.Panel key={_index} header={module.name}>
            {module.sessions?.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay sesiones registradas'} />
            )}
            <List size={'small'}>
              {module.sessions?.map((session, _index) => (
                <List.Item
                  extra={
                    <Popconfirm
                      title={'¿Quieres borrar esta sesión?'}
                      description={'Se borrara también el video relacionado'}
                      onConfirm={() => deleteSession(session.uuid)}>
                      <IconButton icon={<TrashIcon />} small danger />
                    </Popconfirm>
                  }>
                  <div>
                    {session.title} <br />
                    <small>{session.file.name}</small>
                  </div>
                </List.Item>
              ))}
            </List>
            <Space>
              <PrimaryButton
                icon={<PlusIcon />}
                onClick={() => {
                  setOpenSessionForm(true);
                  setSelectedModule(module);
                }}
                label={'Agregar sesión'}
                ghost
                size={'small'}
              />
              <Popconfirm
                title={'¿Quieres borrar este módulo?'}
                description={'Se borraran también todas las sesiones relacionadas y sus videos'}
                onConfirm={() => deleteModule(module.uuid)}>
                <PrimaryButton icon={<TrashIcon />} danger label={'Borrar'} ghost size={'small'} />
              </Popconfirm>
            </Space>
          </Collapse.Panel>
        ))}
      </Collapse>

      <Modal
        destroyOnHidden
        title={'Crear sesión'}
        open={openSessionForm}
        onCancel={() => setOpenSessionForm(false)}
        footer={false}>
        {selectedModule && (
          <ModuleSessionForm
            onComplete={() => {
              setOpenSessionForm(false);
              setReload(!reload);
            }}
            moduleUUID={selectedModule.uuid}
          />
        )}
      </Modal>
    </div>
  );
};

export default CourseModulesManager;
