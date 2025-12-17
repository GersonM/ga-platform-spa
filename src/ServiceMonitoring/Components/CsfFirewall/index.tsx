import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, Col, Divider, Form, Input, notification, Popover, Row, Space} from "antd";

import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import './styles.less';

interface CsfFirewallProps {
  resourceUuid?: string;
}

let timer: any = null;

const CsfFirewall = ({resourceUuid}: CsfFirewallProps) => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [modifiedFields, setModifiedFields] = useState<any[]>([]);

  useEffect(() => {
    if (!resourceUuid) return;
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`external-resources/servers/${resourceUuid}/firewall-config`, config)
      .then(response => {
        if (response) {
          setResources(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const submitForm = (values: any) => {
    console.log('sending form');
    setLoading(true);
    axios.post(`external-resources/servers/${resourceUuid}/firewall-config`, {fields: modifiedFields})
      .then(() => {
        setLoading(false);
        setModifiedFields([]);
        notification.success({message:'Cambios aplicados correctamente'});
      })
      .catch((error) => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      })
  }

  const checkChanges = (values: any, fields: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const touched = fields.filter(f => f.touched)
        .map(f => ({name: f.name[0], value: f.value}));
      setModifiedFields(touched);
    }, 300);
  }

  const getFields = (key: string) => {
    switch (key) {
      case 'TCP_IN':
      case 'TCP_OUT':
        return <Input.TextArea />
      default:
        return <Input/>;
    }
  }

  return (
    <div className={'firewall-config-container'}>
      <LoadingIndicator visible={loading} message={'Listando configuración'}/>
      <Form onFinish={submitForm} layout="vertical" onFieldsChange={checkChanges}>
        <div className={'controls'}>
          <Space split={<Divider type={'vertical'}/>}>
            <PrimaryButton loading={loading} htmlType={'submit'} label={'Guardar'} disabled={modifiedFields.length == 0}/>
            <Button onClick={() => setReload(!reload)} type={"link"}>Recargar</Button>
            <Button onClick={() => setShowHints(!showHints)}
                    type={"link"}>{showHints ? 'Ocultar ayuda' : 'Mostrar ayuda'}</Button>
          </Space>
        </div>
        {modifiedFields.length > 0 && (<div>
          {modifiedFields.length} campos modificados
        </div>)}
        <Divider/>
        <Row gutter={[20, 20]}>
          {resources?.map((item, i) => (
            <Col md={8} key={i}>
              <Form.Item name={item.key} label={item.key} initialValue={item.value}>
                {getFields(item.key)}
              </Form.Item>
              <Popover trigger={'click'} content={<pre>{item.comment}</pre>}>
                <small>{item.comment.substring(0, 120)}...</small>
              </Popover>
            </Col>
          ))}
        </Row>
      </Form>
    </div>
  );
};

export default CsfFirewall;
