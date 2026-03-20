import {useEffect, useMemo, useState} from 'react';
import {Drawer, Form, Input, Popconfirm, Space, Steps, Tooltip} from 'antd';
import {TbListCheck, TbPencil, TbThumbUp, TbTrash, TbUsers} from "react-icons/tb";
import {useParams} from 'react-router-dom';
import {FaPeoplePulling} from "react-icons/fa6";
import {BiCog} from 'react-icons/bi';
import dayjs from 'dayjs';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {
  Campaign,
  CommercialProcess,
  CommercialProcessStage,
  EntityActivity,
  EntityFieldValue,
  Lead,
  Profile,
  ResponsePagination
} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import CampaignsManager from '../../Components/CampaignsManager';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import CreateLeadForm from '../../Components/CreateLeadForm';
import CampaignSelector from '../../Components/CampaignSelector';
import ModalView from "../../../CommonUI/ModalView";
import TablePagination from "../../../CommonUI/TablePagination";
import InfoButton from "../../../CommonUI/InfoButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import IconButton from "../../../CommonUI/IconButton";
import AttributesList from "../../../EntityFields/Components/AttributesList";
import EntityActivityManager from "../../../CommonUI/EntityActivityManager";
import CommercialProcessSelector from "../../../CRMModule/Components/CommercialProcessSelector";
import CustomTag from "../../../CommonUI/CustomTag";
import CommercialProcessStageSelector from "../../../CRMModule/Components/CommercialProcessStageSelector";

const getProcessStages = (process?: CommercialProcess): CommercialProcessStage[] => {
  if (!process) {
    return [];
  }

  const source: any = process;
  if (Array.isArray(source.stages)) {
    return source.stages;
  }
  if (Array.isArray(source.process_stages)) {
    return source.process_stages;
  }
  if (Array.isArray(source.steps)) {
    return source.steps;
  }
  return [];
};

const CommercialLeads = () => {
  const [leads, setLeads] = useState<Lead[]>();
  const [openCampaignManager, setOpenCampaignManager] = useState(false);
  const [reload, setReload] = useState(false);
  const params = useParams();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openLeadForm, setOpenLeadForm] = useState(false);
  const [openActivityManager, setOpenActivityManager] = useState(false);
  const [openPromoteModal, setOpenPromoteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead>();
  const [selectedProcess, setSelectedProcess] = useState<CommercialProcess>();
  const [selectedStage, setSelectedStage] = useState<CommercialProcessStage>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const [promoting, setPromoting] = useState(false);
  const [promoteForm] = Form.useForm();

  const processStages = useMemo(() => getProcessStages(selectedProcess), [selectedProcess]);

  const processSteps = useMemo(() => {
    const stages = processStages;
    if (!stages.length) {
      return [{key: 'all', title: 'Todos los procesos', icon: <TbUsers/>}];
    }

    return stages.map((stage, index) => ({
      key: stage.uuid || `${index + 1}`,
      title: stage.name || `Etapa ${index + 1}`,
      description: <small>3 contactos</small>,
    }));
  }, [selectedProcess]);

  useEffect(() => {
    setSelectedStage(processStages[0]);
  }, [processStages]);

  useEffect(() => {
    if (!openPromoteModal) {
      return;
    }
    const leadStageUuid = (selectedLead as any)?.process_stage?.uuid ?? (selectedLead as any)?.process_stage_uuid;
    const currentIndex = processStages.findIndex(stage => stage.uuid === (leadStageUuid || selectedStage?.uuid));
    const nextStage = processStages[currentIndex + 1] ?? processStages[currentIndex] ?? processStages[0];
    promoteForm.setFieldsValue({
      process_stage_uuid: leadStageUuid || nextStage?.uuid,
      message: '',
    });
  }, [openPromoteModal, processStages, promoteForm, selectedStage, selectedLead]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        process_stage_uuid: selectedStage?.uuid,
        campaign_uuid: selectedCampaign?.uuid,
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
  }, [reload, currentPage, pageSize, selectedStage, selectedCampaign]);

  const deleteLead = (lead: Lead) => {
    axios.delete(`commercial/leads/${lead.uuid}/leads`, {})
      .then(() => {
      })
      .catch(error => {
        ErrorHandler.showNotification(error);

      })
  }

  const promoteLead = (values: any) => {
    if (!selectedLead) {
      return;
    }
    setPromoting(true);
    axios
      .put(`commercial/leads/${selectedLead.uuid}`, values)
      .then(() => {
        setOpenPromoteModal(false);
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      })
      .finally(() => {
        setPromoting(false);
      });
  };

  const columns = [
    {
      dataIndex: 'uuid',
      fixed: 'left',
      width: 137,
      render: (_uuid: string, lead: Lead) => (
        <Space>
          <IconButton
            small
            onClick={() => {
              setSelectedLead(lead);
              setOpenLeadForm(true);
            }}
            icon={<TbPencil/>}
          />
          <Tooltip title={'Ver historial de actividades'}>
            <IconButton
              small
              onClick={() => {
                setSelectedLead(lead);
                setOpenActivityManager(true);
              }}
              icon={<TbListCheck/>}
            />
          </Tooltip>
          <Popconfirm title={'Eliminar ruta'} onConfirm={() => deleteLead(lead)}>
            <IconButton small danger icon={<TbTrash/>}/>
          </Popconfirm>
          <IconButton
            title={'Promover candidato'}
            small
            icon={<FaPeoplePulling/>}
            onClick={() => {
              setSelectedLead(lead);
              setOpenPromoteModal(true);
            }}
          />
        </Space>
      ),
    },
    {
      dataIndex: 'created_at',
      title: 'Fecha',
      width: 100,
      render: (created_at: string) => {
        return <div>
          {dayjs(created_at).format('DD/MM/YYYY')}
          <small>
            {dayjs(created_at).format('HH:mm:ss')}
          </small>
        </div>
      },
    },
    {
      dataIndex: 'campaign',
      title: 'Campaña',
      width: 110,
      render: (c: Campaign) => {
        return c && <CustomTag>{c.name}</CustomTag>;
      },
    },
    {
      dataIndex: 'process_stage',
      title: 'Etapa',
      width: 150,
      render: (s: CommercialProcessStage) => {
        return s && <CustomTag>{s.name}</CustomTag>;
      },
    },
    {
      dataIndex: 'profile',
      title: 'Candidato',
      width: 190,
      render: (profile: Profile) => {
        return <ProfileChip profile={profile} showDocument/>;
      },
    },
    {
      dataIndex: 'profile',
      title: 'Teléfono',
      width: 190,
      render: (profile: Profile) => {
        return profile.phone;
      },
    },
    {
      dataIndex: 'profile',
      title: 'E-mail',
      width: 190,
      render: (profile: Profile) => {
        return profile.email;
      },
    },
    {
      dataIndex: 'profile',
      title: 'E-mail personal',
      width: 190,
      render: (profile: Profile) => {
        return profile.personal_email;
      },
    },
    {
      dataIndex: 'referer',
      title: 'Agente',
      width: 190,
      render: (profile: Profile) => {
        return <ProfileChip profile={profile}/>;
      },
    },
    {
      dataIndex: 'last_activity',
      title: 'Actividad',
      width: 220,
      render: (last_activity: EntityActivity) => {
        return last_activity && <>
          <small>{last_activity?.profile?.name} {dayjs(last_activity?.created_at).fromNow()}</small>
          {last_activity?.comment}
        </>;
      },
    },
    {
      dataIndex: 'attributes',
      width: 220,
      title: 'Atributos',
      render: (attributes: EntityFieldValue[]) => {
        return <AttributesList attributes={attributes}/>;
      },
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader
        title={'Candidatos'}
        onRefresh={() => setReload(!reload)}
        onAdd={() => {
          setOpenLeadForm(true);
          setSelectedLead(undefined);
        }}
        loading={loading}
        tools={
          <Space>
            <CommercialProcessSelector
              value={selectedProcess?.uuid}
              onChange={(_value, option) => {
                const selectedOption = Array.isArray(option) ? option[0] : option;
                setSelectedProcess((selectedOption as any)?.entity);
              }}
            />
            <CampaignSelector
              refresh={reload}
              onChange={(_value, option) => {
                setSelectedCampaign((option as any)?.entity);
              }}
              value={params.campaign}
            />
            <InfoButton icon={<TbUsers/>} value={pagination?.total}/>
            <PrimaryButton
              icon={<BiCog size={17}/>}
              label={'Gestionar campañas'}
              ghost
              onClick={() => setOpenCampaignManager(true)}
            />
          </Space>
        }
      >
        <Steps
          style={{margin: '10px -20px 0 -20px'}}
          size={'small'}
          type={'navigation'}
          variant={'outlined'}
          current={Math.max(0, getProcessStages(selectedProcess).findIndex(item => item.uuid === selectedStage?.uuid))}
          items={processSteps}
          onChange={(currentIndex) => {
            const stages = getProcessStages(selectedProcess);
            setSelectedStage(stages[currentIndex]);
          }}
        />
      </ContentHeader>
      <TableList scroll={{x:1000}} columns={columns} dataSource={leads}/>
      <TablePagination
        pagination={pagination}
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
      />
      <ModalView open={openLeadForm} onCancel={() => setOpenLeadForm(false)}>
        <CreateLeadForm lead={selectedLead} onComplete={() => {
          setReload(!reload);
          setOpenLeadForm(false);
        }}/>
      </ModalView>
      <ModalView
        open={openPromoteModal}
        onCancel={() => setOpenPromoteModal(false)}
        title={'Promover candidato'}
      >
        <Form form={promoteForm} layout={'vertical'} onFinish={promoteLead}>
          <Form.Item
            name={'process_stage_uuid'}
            label={'Etapa destino'}
            rules={[{required: true, message: 'Selecciona una etapa'}]}
          >
            <CommercialProcessStageSelector />
          </Form.Item>
          <Form.Item name={'message'} label={'Mensaje'}>
            <Input.TextArea rows={4} placeholder={'Escribe un mensaje para el candidato'} />
          </Form.Item>
          <PrimaryButton
            block
            loading={promoting}
            label={'Promover candidato'}
            htmlType={'submit'}
            icon={<TbThumbUp/>}
          />
        </Form>
      </ModalView>
      <Drawer
        styles={{body: {padding: 0,},}}
        destroyOnHidden open={openActivityManager} onClose={() => setOpenActivityManager(false)}>
        {selectedLead &&
          <EntityActivityManager uuid={selectedLead?.uuid} type={'lead'}/>
        }
      </Drawer>
      <Drawer
        title={'Campañas'}
        open={openCampaignManager}
        onClose={() => {
          setOpenCampaignManager(false);
          setReload(!reload);
        }}>
        <CampaignsManager/>
      </Drawer>
    </ModuleContent>
  );
};

export default CommercialLeads;
