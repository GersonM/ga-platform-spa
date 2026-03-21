import {useEffect, useState} from 'react';
import {Col, DatePicker, Form, Input, message, Row, Space, Tooltip} from 'antd';
import {TbCopy, TbTrash} from "react-icons/tb";
import {useForm} from 'antd/lib/form/Form';
import dayjs from 'dayjs';
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import type {Campaign} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import IconButton from '../../../CommonUI/IconButton';

const CampaignsManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  const [reload, setReload] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`commercial/campaigns`, config)
      .then(response => {
        if (response) {
          setCampaigns(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const createCampaigns = (values: any) => {
    axios
      .post('commercial/campaigns', values)
      .then(() => {
        setReload(!reload);
        form.resetFields();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const deleteCampaigns = (uuid: string) => {
    axios
      .delete(`commercial/campaigns/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const copyPublicEndpoint = async (publicEndpoint?: string) => {
    if (!publicEndpoint) {
      message.warning('La campaña no tiene public_endpoint');
      return;
    }

    try {
      await navigator.clipboard.writeText(publicEndpoint);
      message.success('Endpoint copiado');
    } catch (_error) {
      message.error('No se pudo copiar el endpoint');
    }
  };

  const columns = [
    {
      dataIndex: 'name',
      title: 'Campaña',
      render: (name: string, campaign: any) => {
        const public_endpoint = campaign?.public_endpoint as string | undefined;
        return (
          <Space direction={'vertical'} size={2}>
            <strong>{name || '-'}</strong>
            <Space>
              <small>{public_endpoint || '-'}</small>
              {public_endpoint && (
                <Tooltip title={'Copiar url'}>
                  <IconButton
                    icon={<TbCopy />}
                    small
                    onClick={() => copyPublicEndpoint(public_endpoint)}
                  />
                </Tooltip>
              )}
            </Space>
          </Space>
        );
      },
    },
    {
      dataIndex: 'start_date',
      title: 'Inicio',
      render: (start_date: string) => dayjs(start_date).format('DD/MM/YYYY HH:mm a'),
    },
    {dataIndex: 'description', title: 'Descripción'},
    {
      dataIndex: 'uuid',
      render: (uuid: string) => {
        return <IconButton icon={<TbTrash />} danger onClick={() => deleteCampaigns(uuid)} />;
      },
    },
  ];

  return (
    <>
      <Form form={form} layout={'vertical'} onFinish={createCampaigns}>
        <Form.Item name={'name'} label={'Nombre'}>
          <Input />
        </Form.Item>
        <Row gutter={15}>
          <Col md={12}>
            <Form.Item name={'date_start'} label={'Fecha de inicio'}>
              <DatePicker style={{width: '100%'}} placeholder={'Inicio'} />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name={'date_end'} label={'Fecha de fin'}>
              <DatePicker style={{width: '100%'}} placeholder={'Final (opcional)'} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={'description'} label={'Descripción'}>
          <Input.TextArea />
        </Form.Item>
        <PrimaryButton label={'Crear'} block htmlType={'submit'} />
      </Form>
      <TableList columns={columns} dataSource={campaigns} />
    </>
  );
};

export default CampaignsManager;
