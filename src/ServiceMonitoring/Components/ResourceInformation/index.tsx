import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Button, Card, Col, Divider, Progress, Row, Space, Tooltip} from "antd";
import {LuClock, LuCpu, LuMemoryStick} from "react-icons/lu";

import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import CustomTag from "../../../CommonUI/CustomTag";
import './styles.less';
import {TbClockPin, TbReload} from "react-icons/tb";
import ResourceStatus from "../ResourceStatus";
import {PlusOutlined} from "@ant-design/icons";

interface ResourceInformationProps {
  resourceUuid?: string;
}

const ResourceInformation = ({resourceUuid}: ResourceInformationProps) => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [serverInfo, setServerInfo] = useState<any>();
  const [force, setForce] = useState(false);

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

  return (
    <div className={'resource-info-container'}>
      <Row gutter={24}>
        <Col span={8}>
          <Divider>Hardware</Divider>
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
          <Button
            loading={loading}
            block
            type="primary"
            ghost
            icon={<TbReload />}
            onClick={() => {
              setForce(true);
              setReload(!reload);
            }}>Actualizar información</Button>
        </Col>
        <Col span={16}>
          Log
          <Card>
            Last log
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResourceInformation;
