import React, {useContext, useEffect, useState} from 'react';
import {Card, Checkbox, Col, Drawer, Empty, Form, Input, InputNumber, Row, Space, Statistic} from 'antd';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Campaign, Lead, Profile} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import CampaignsManager from '../../Components/CampaignsManager';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import CreateLeadForm from '../../Components/CreateLeadForm';
import CampaignSelector from '../../Components/CampaignSelector';
import {useNavigate, useParams} from 'react-router-dom';
import {BiCog} from 'react-icons/bi';
import AuthContext from '../../../Context/AuthContext';

const CommercialLeads = () => {
  const {user} = useContext(AuthContext);
  const [leads, setLeads] = useState<any>();
  const [openCampaignManager, setOpenCampaignManager] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`commercial/leads/stats`, config)
      .then(response => {
        if (response) {
          setLeads(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const columns = [
    {
      dataIndex: 'profile',
      title: 'Nombres',
      width: 100,
      render: (profile: Profile) => {
        return `${profile.name} ${profile.last_name}`;
      },
    },
    {
      dataIndex: 'score',
      title: 'Score',
    },
    {
      dataIndex: 'referer',
      title: 'Asesor',
      render: (profile: Profile) => {
        return profile ? `${profile.name} ${profile.last_name}` : '';
      },
    },
    {
      dataIndex: 'campaign',
      title: 'Campaña',
      render: (c: Campaign) => {
        return c.name;
      },
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader
        title={'Leads'}
        tools={
          <Space>
            <CampaignSelector
              refresh={reload}
              value={params.campaign}
              onChange={value => {
                if (!value) {
                  navigate(`/commercial/leads`);
                } else {
                  navigate(`/commercial/leads/${value}`);
                }
              }}
            />
            {user?.roles?.includes('admin') && (
              <PrimaryButton
                icon={<BiCog size={17} />}
                label={'Gestionar campañas'}
                ghost
                onClick={() => setOpenCampaignManager(true)}
              />
            )}
          </Space>
        }
      />
      <Row gutter={[20, 20]}>
        <Col lg={12} xs={24}>
          {params.campaign ? (
            <CreateLeadForm
              campaignUuid={params.campaign}
              onComplete={() => {
                setReload(!reload);
              }}
            />
          ) : (
            <Empty description={'Selecciona una campaña'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Col>
        <Col lg={12} xs={24}>
          <Card size={'small'} bordered={false}>
            <Statistic title={'Ingresos registrados'} value={leads?.total_leads} />
          </Card>
        </Col>
      </Row>
      <Drawer
        title={'Campañas'}
        open={openCampaignManager}
        onClose={() => {
          setOpenCampaignManager(false);
          setReload(!reload);
        }}>
        <CampaignsManager />
      </Drawer>
    </ModuleContent>
  );
};

export default CommercialLeads;
