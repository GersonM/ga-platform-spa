import React, {useEffect, useState} from 'react';
import {Checkbox, Col, Drawer, Empty, Form, Input, InputNumber, Row} from 'antd';
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

const CommercialLeads = () => {
  const [leads, setLeads] = useState<Lead[]>();
  const [openCampaignManager, setOpenCampaignManager] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`commercial/leads`, config)
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
          <>
            <CampaignSelector
              value={params.campaign}
              onChange={value => {
                if (!value) {
                  navigate(`/commercial/leads`);
                } else {
                  navigate(`/commercial/leads/${value}`);
                }
              }}
            />
            <PrimaryButton
              icon={<BiCog size={17} />}
              label={'Gestionar campañas'}
              ghost
              onClick={() => setOpenCampaignManager(true)}
            />
          </>
        }
      />
      <Row gutter={[20, 20]}>
        <Col md={12}>
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
        <Col md={12}>
          <TableList columns={columns} dataSource={leads} />
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
