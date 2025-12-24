import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Button, Card, Col, Divider, notification, Popconfirm, Progress, Row, Space, Tooltip} from "antd";
import {LuCpu, LuMemoryStick} from "react-icons/lu";

import CustomTag from "../../../CommonUI/CustomTag";
import {TbClockPin, TbPower, TbReload, TbTimeline, TbWorldWww} from "react-icons/tb";
import ResourceStatus from "../ResourceStatus";
import './styles.less';
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

interface ResourceInformationProps {
  resourceUuid?: string;
}

const ResourceInformation = ({resourceUuid}: ResourceInformationProps) => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [serverInfo, setServerInfo] = useState<any>();
  const [resource, setResource] = useState<any>();
  const [force, setForce] = useState(false);
  const [serverLog, setServerLog] = useState<any>();

  useEffect(() => {
    if (!resourceUuid) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`external-resources/${resourceUuid}`, config)
      .then(response => {
        if (response) {
          setResource(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  useEffect(() => {
    if (!resourceUuid) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {force: force ? 1 : null},
    };

    setLoading(true);
    console.log('updating')

    axios
      .get(`external-resources/servers/${resourceUuid}/info`, config)
      .then(response => {
        if (response) {
          setServerInfo(response.data);
          setForce(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  useEffect(() => {
    if (!resourceUuid) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {force: force ? 1 : null},
    };

    setLoading(true);
    console.log('updating')

    axios
      .get(`external-resources/servers/${resourceUuid}/logs`, config)
      .then(response => {
        if (response) {
          setServerLog(response.data);
          setForce(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const resetServer = (uuid?: string) => {
    if(!resourceUuid) return;
    setLoading(true);
    axios.post(`external-resources/servers/${uuid}/reset`)
      .then(() => {
        setLoading(false);
        notification.success({message: 'Reinicio en proceso'});
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      })
  }

  return (
    <div className={'resource-info-container'}>
      <Row gutter={24}>
        <Col span={8}>
          <Divider>Hardware</Divider>
          <div className={'hardware-item'}>
            <TbWorldWww/>
            <div>
              <small>IP pública</small>
              {resource?.id}
            </div>
          </div>
          <div className={'hardware-item'}>
            <LuCpu/>
            <div>
              <small>CPU</small>
              {serverInfo?.cpu} <ResourceStatus resourceUuid={resourceUuid}/>
            </div>
          </div>
          <div className={'hardware-item'}>
            <LuMemoryStick/>
            <div>
              <small>Memoria RAM</small>
              {serverInfo?.memory?.memory.available} disponible de {' '}
              {serverInfo?.memory?.memory.total}
            </div>
          </div>
          <div className={'hardware-item'}>
            <TbClockPin/>
            <div>
              <small>Zona horaria</small>
              {serverInfo?.timezone}
            </div>
          </div>
          <div className={'hardware-item'}>
            <TbTimeline/>
            <div>
              <small>Tiempo activo</small>
              {resource?.uptime}
            </div>
          </div>
          <Divider>Uso de disco</Divider>
          <Space size={'large'}>
            {serverInfo?.disk?.map((d: any) => {
              return (<div key={d.id} className={'server-info'}>
                <Progress
                  size={120}
                  format={val => <>
                    {val}% <br/>
                    <CustomTag>{d.mount}</CustomTag>
                  </>}
                  type={"dashboard"} percent={d.use_percent}/>
                <div>{d.available} de {d.size}</div>
              </div>)
            })}
          </Space>
          <br/>
          <br/>
          <Space>
            <Button
              loading={loading}
              type="primary"
              ghost
              icon={<TbReload/>}
              onClick={() => {
                setForce(true);
                setReload(!reload);
              }}>Actualizar información</Button>
            <Popconfirm
              title={'¿Quieres reiniciar el servicio?'} description={'Forzar reinicio del sistema'}
              onConfirm={() => resetServer(resourceUuid)}
            >
              <PrimaryButton icon={<TbPower size={22} style={{verticalAlign: 'middle'}}/>} danger
                             label={'Reiniciar'}/>
            </Popconfirm>
          </Space>
        </Col>
        <Col span={16}>
          <Card>
            Última actividad del sistema
            <small>

              <code>
                {serverLog?.raw}
              </code>
            </small>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResourceInformation;
