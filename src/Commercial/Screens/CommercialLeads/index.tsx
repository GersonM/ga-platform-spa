import {useContext, useEffect, useState} from 'react';
import {Button, Card, Col, Drawer, Empty, Pagination, Row, Space, Statistic} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {BiCog} from 'react-icons/bi';
import dayjs from 'dayjs';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {Campaign, Lead, Profile, ResponsePagination} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import CampaignsManager from '../../Components/CampaignsManager';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import CreateLeadForm from '../../Components/CreateLeadForm';
import CampaignSelector from '../../Components/CampaignSelector';
import AuthContext from '../../../Context/AuthContext';

const CommercialLeads = () => {
  const {user} = useContext(AuthContext);
  const [leads, setLeads] = useState<Lead[]>();
  const [openCampaignManager, setOpenCampaignManager] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        campaign_uuid: params.campaign,
        page: currentPage,
        page_size: pageSize,
      },
    };

    setLoading(true);

    axios
      .get(`commercial/leads`, config)
      .then(response => {
        if (response) {
          setLeads(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });

    return cancelTokenSource.cancel;
  }, [reload, params.campaign, currentPage, pageSize]);

  const columns = [
    {
      dataIndex: 'created_at',
      title: 'Fecha',
      width: 100,
      render: (created_at: string) => {
        return dayjs(created_at).format('DD-MM-YYYY HH:mm:ss');
      },
    },
    {
      dataIndex: 'profile',
      title: 'Nombres',
      width: 190,
      render: (profile: Profile) => {
        return `${profile.name} ${profile.last_name}`;
      },
    },
    {
      dataIndex: 'profile',
      title: 'DNI',
      render: (profile: Profile) => profile.doc_number,
    },
    {
      dataIndex: 'referer',
      title: 'Sponsor',
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
                  navigate(`/crm/leads`);
                } else {
                  navigate(`/crm/leads/${value}`);
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
        <Col lg={8} xs={24}>
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
        <Col lg={16} xs={24}>
          <h3>Personas</h3>
          <Card size={'small'} loading={loading}>
            <Statistic title={'Ingresos registrados'} value={pagination?.total} />
            <TableList columns={columns} dataSource={leads} />
          </Card>
          {pagination && (
            <Pagination
              size={'small'}
              current={pagination.current_page}
              total={pagination.total}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          )}
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
