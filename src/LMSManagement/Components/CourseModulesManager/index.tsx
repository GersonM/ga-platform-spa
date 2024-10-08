import React, {useEffect, useState} from 'react';
import {Course, CourseModule} from '../../../Types/api';
import axios from 'axios';
import {Collapse, Empty, List, Modal, Space} from 'antd';
import IconButton from '../../../CommonUI/IconButton';
import {PlusIcon, TrashIcon} from '@heroicons/react/24/solid';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import CourseForm from '../CourseForm';
import ModuleSessionForm from '../ModuleSessionForm';

interface CourseModulesManagerProps {
  courseUUID: string;
  refresh?: boolean;
}

const CourseModulesManager = ({refresh, courseUUID}: CourseModulesManagerProps) => {
  const [loading, setLoading] = useState(false);
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
  return (
    <div>
      <Collapse size={'small'}>
        {modules?.map((module, index) => (
          <Collapse.Panel key={index} header={module.name}>
            {module.sessions?.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay sesiones registradas'} />
            )}
            <List size={'small'}>
              {module.sessions?.map((session, index) => (
                <List.Item extra={<IconButton icon={<TrashIcon />} small danger />}>{session.title}</List.Item>
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
              <PrimaryButton icon={<TrashIcon />} danger label={'Borrar'} ghost size={'small'} />
            </Space>
          </Collapse.Panel>
        ))}
      </Collapse>

      <Modal
        destroyOnClose
        title={'Crear curso'}
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
