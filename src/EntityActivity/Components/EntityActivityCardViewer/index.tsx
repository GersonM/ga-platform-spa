import {useContext, useEffect, useState} from 'react';
import {Button, Col, Divider, Empty, Form, Input, Modal, Popconfirm, Row, Space, Tabs, Tooltip} from 'antd';
import axios from 'axios';
import {PiArrowRight, PiCheckBold, PiProhibit, PiTrash} from 'react-icons/pi';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {EntityActivity} from '../../../Types/api';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import AuthContext from '../../../Context/AuthContext';

interface EntityActivityCardViewerProps {
  entityActivityUUID?: string;
  open?: boolean;
  onCancel?: () => void;
}

const EntityActivityCardViewer = ({entityActivityUUID, ...props}: EntityActivityCardViewerProps) => {
  const {user} = useContext(AuthContext);
  const [entityActivity, setEntityActivity] = useState<EntityActivity>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (entityActivityUUID) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`entity-activity/${entityActivityUUID}`, config)
        .then(response => {
          if (response) {
            setEntityActivity(response.data);
          }
        })
        .catch(e => {
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [entityActivityUUID]);

  const completeTask = () => {
    const resolve = !!entityActivity?.completed_at;
    axios
      .post(
        resolve ? `entity-activity/${entityActivityUUID}/pending` : `entity-activity/${entityActivityUUID}/complete`,
        {},
      )
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const deleteTask = () => {
    axios
      .delete(`entity-activity/${entityActivityUUID}`, {})
      .then(() => {
        props.onCancel && props.onCancel();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  if (!entityActivity) {
    return <LoadingIndicator />;
  }

  return (
    <Modal footer={false} open={!!entityActivityUUID} {...props}>
      <h2>{entityActivity?.comment}</h2>
      <Space>
        {user?.roles?.includes('admin') && (
          <Popconfirm
            onConfirm={() => deleteTask()}
            title={'¿Seguro que quieres borrar esta actividad?'}
            description={'Se eliminará toda la información relacionada'}>
            <Button icon={<PiTrash size={16} />} danger>
              Eliminar
            </Button>
          </Popconfirm>
        )}
        <Popconfirm
          onConfirm={completeTask}
          title={
            entityActivity.completed_at ? 'Marcar tarea como no resuelta' : 'Vas a marcar esta tarea como completada'
          }
          description={
            entityActivity.completed_at ? 'Se reactivarán las alertas para esta tarea' : 'No se emitirán nuevas alertas'
          }>
          <Tooltip
            title={entityActivity.completed_at ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
            placement={'bottom'}>
            <Button icon={entityActivity.completed_at ? <PiProhibit size={17} /> : <PiCheckBold size={17} />}>
              {entityActivity.completed_at ? 'Marca como pendiente' : 'Marca como completado'}
            </Button>
          </Tooltip>
        </Popconfirm>
      </Space>
      <Divider />
      <Form.Item>
        <Input.TextArea variant={'filled'} onClick={completeTask} placeholder={'Sin detalles'} />
      </Form.Item>
      <Form.Item>
        <Row gutter={[20, 20]} align="middle">
          <Col span={11}>
            <strong>Reportado por:</strong>
            <ProfileChip profile={entityActivity?.profile} />
          </Col>
          <Col span={2}>
            <PiArrowRight size={18} />
          </Col>
          <Col span={11}>
            <strong>Asignado a:</strong>
            {entityActivity?.assigned_to ? (
              <ProfileChip profile={entityActivity?.assigned_to} />
            ) : (
              <PrimaryButton label={'Asignar responsable'} block />
            )}
          </Col>
        </Row>
      </Form.Item>
      <div>
        <Tabs
          items={[
            {
              label: 'Comentarios',
              key: 'comments',
              children: (
                <>
                  <Empty description={'Sin comentarios'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </>
              ),
            },
            {
              label: 'Actividad',
              key: 'activity',
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default EntityActivityCardViewer;
