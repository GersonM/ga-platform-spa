import {useEffect, useState} from 'react';
import {Col, DatePicker, Form, Input, Row} from 'antd';
import {TrashIcon} from '@heroicons/react/16/solid';
import {useForm} from 'antd/lib/form/Form';
import dayjs from 'dayjs';
import axios from 'axios';

import TableList from '../../../CommonUI/TableList';
import {Campaign} from '../../../Types/api';
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

  const columns = [
    {dataIndex: 'name', title: 'Nombre'},
    {
      dataIndex: 'start_date',
      title: 'Inicio',
      render: (start_date: string) => dayjs(start_date).format('DD/MM/YYYY HH:mm a'),
    },
    {dataIndex: 'description', title: 'Descripción'},
    {
      dataIndex: 'uuid',
      title: 'Actions',
      render: (uuid: string) => {
        return <IconButton icon={<TrashIcon />} danger onClick={() => deleteCampaigns(uuid)} />;
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
      <TableList size={'small'} columns={columns} dataSource={campaigns} />
    </>
  );
};

export default CampaignsManager;
