import {useEffect, useState} from 'react';
import {Button, Col, Divider, Form, Image, Popconfirm, Row, Space, Tooltip} from 'antd';
import axios from 'axios';
import dayjs from "dayjs";
import {PiArrowRight, PiCheckBold, PiProhibit, PiTrash} from 'react-icons/pi';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {ApiFile, EntityActivity} from '../../../Types/api';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ModalView from "../../../CommonUI/ModalView";
import FileIcon from "../../../FileManagement/Components/FileIcon";

interface EntityActivityCardViewerProps {
  entityActivityUUID?: string;
  open?: boolean;
  onCancel?: () => void;
}

const EntityActivityCardViewer = ({entityActivityUUID, ...props}: EntityActivityCardViewerProps) => {
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
        props.onCancel?.();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  if (!entityActivity) {
    return <LoadingIndicator/>;
  }

  return (
    <ModalView open={!!entityActivityUUID} {...props}>
      <h3>Creado {dayjs(entityActivity?.created_at).fromNow()} por {entityActivity?.profile?.name}</h3>
      <p>{entityActivity?.comment}</p>
      <Image.PreviewGroup>
        {entityActivity?.attachments?.map((at: ApiFile) => (
          <>
            {at.type.includes('ima') ? (
              <Image
                key={at.uuid}
                preview={{
                  destroyOnClose: true,
                  src: at.source,
                }}
                loading={'lazy'}
                src={at.thumbnail}
                width={70}
              />
            ) : (
              <Tooltip title={at.name}>
                <a href={at.source} target={'_blank'}>
                  <FileIcon file={at} size={25}/>
                </a>
              </Tooltip>
            )}
          </>
        ))}
      </Image.PreviewGroup>
      <Divider/>
      <Space>
        <Popconfirm
          onConfirm={() => deleteTask()}
          title={'¿Seguro que quieres borrar esta actividad?'}
          description={'Se eliminará toda la información relacionada'}>
          <Button icon={<PiTrash size={16}/>} danger>
            Eliminar
          </Button>
        </Popconfirm>
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
            <Button icon={entityActivity.completed_at ? <PiProhibit size={17}/> : <PiCheckBold size={17}/>}>
              {entityActivity.completed_at ? 'Marca como pendiente' : 'Marca como completado'}
            </Button>
          </Tooltip>
        </Popconfirm>
      </Space>
      <Divider/>
      <Form.Item>
        <Row gutter={[20, 20]} align="middle">
          <Col span={11}>
            <strong>Reportado por:</strong>
            <ProfileChip profile={entityActivity?.profile}/>
          </Col>
          <Col span={2}>
            <PiArrowRight size={18}/>
          </Col>
          <Col span={11}>
            <strong>Asignado a:</strong>
            {entityActivity?.assigned_to ? (
              <ProfileChip profile={entityActivity?.assigned_to}/>
            ) : (
              <PrimaryButton label={'Asignar responsable'} block disabled/>
            )}
          </Col>
        </Row>
      </Form.Item>

    </ModalView>
  );
};

export default EntityActivityCardViewer;
