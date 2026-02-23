import {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {Card, Col, Collapse, Divider, Modal, Popconfirm, Row, Select, Space, Switch, Tag, Tooltip} from "antd";
import {TbCalendarUp, TbCalendarX, TbCancel, TbPencil, TbReceipt2, TbThumbUp, TbTrash} from "react-icons/tb";
import {PiCalendarX, PiIdentificationCard, PiPlusBold} from "react-icons/pi";
import axios from "axios";
import dayjs from "dayjs";

import ModuleContent from '../../../CommonUI/ModuleContent';
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {Profile, Subscription, SubscriptionMember} from "../../../Types/api.tsx";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import InfoButton from "../../../CommonUI/InfoButton";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import MoneyString from "../../../CommonUI/MoneyString";
import TableList from "../../../CommonUI/TableList";
import InvoicesTable from "../../../PaymentManagement/Components/InvoicesTable";
import EntityActivityManager from "../../../CommonUI/EntityActivityManager";
import AddMemberSubscription from "../../../PaymentManagement/Components/AddMemberSubscription";
import SubscriptionForm from "../../Components/SubscriptionForm";
import ProfileEditor from "../../../AccountManagement/Components/ProfileEditor";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import ProfileDocument from "../../../CommonUI/ProfileTools/ProfileDocument.tsx";
import FamilyRelationSelector from "../../../CommonUI/FamilyRelationSelector";
import IconButton from "../../../CommonUI/IconButton";
import Config from "../../../Config.tsx";
import CustomTag from "../../../CommonUI/CustomTag";

const ClubSubscription = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>();
  const [reload, setReload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [tempURL, setTempURL] = useState<string>();
  const [pdfWatermark, setPdfWatermark] = useState(false);
  const [carnetTemplate, setCarnetTemplate] = useState<string>();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openEditSubscription, setOpenEditSubscription] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`subscriptions/${params.subscription}`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setSubscription(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [params.subscription, reload]);

  const disableMember = (uuid: string) => {
    axios
      .post(`subscriptions/members/${uuid}/disable`, {})
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const enableMember = (uuid: string) => {
    axios
      .post(`subscriptions/members/${uuid}/enable`, {})
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const deleteMember = (uuid: string) => {
    axios
      .delete(`subscriptions/members/${uuid}`, {})
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const columns = [
    {
      title: 'Nombres',
      dataIndex: 'profile',
      render: (profile: Profile) => <ProfileChip profile={profile}/>,
    },
    {
      title: 'Documento',
      dataIndex: 'profile',
      width: 120,
      render: (profile: Profile) => <ProfileDocument profile={profile}/>,
    },
    {
      title: 'Registrado',
      dataIndex: 'created_at',
      width: 135,
      render: (created_at: string) => {
        return (<>
          {dayjs(created_at).fromNow()}
          <small>{dayjs(created_at).format('DD/MM/YYYY hh:mm a')}</small>
        </>)
      },
    },
    {
      title: 'Relación',
      align: 'center',
      dataIndex: 'relation_type',
      render: (relation: string, member: SubscriptionMember) => {
        return (relation === 'SOCIO' || relation === 'SOCIA') ? (
          <CustomTag color={'cyan'}>Socio titular</CustomTag>
        ) : (
          <FamilyRelationSelector
            value={relation}
            style={{width: 100}}
            size="small"
            onChange={(value: string) => {
              console.log(value);
              setLoading(true);
              axios
                .put(`subscriptions/members/${member.uuid}`, {
                  relation_type: value,
                })
                .then(response => {
                  setLoading(false);
                  console.log(response);
                  setReload(!reload);
                })
                .catch(error => {
                  ErrorHandler.showNotification(error);
                  setLoading(false);
                });
            }}
          />
        );
      },
    },
    {
      dataIndex: 'uuid',
      render: (uuid: string, row: SubscriptionMember) => (
        <Space>
          <IconButton icon={<TbPencil/>} onClick={() => setSelectedProfile(row.profile)} small/>
          <Popconfirm
            title={'Eliminar miembro'}
            onConfirm={() => deleteMember(uuid)}
            description={'Esto no eliminará a la persona, solo su relación con esta subscripción'}>
            <IconButton danger icon={<TbTrash/>} small/>
          </Popconfirm>
          {row.suspended_at ? (
            <Tooltip title="Activar miembro">
              <IconButton icon={<TbThumbUp/>} small onClick={() => enableMember(uuid)}/>
            </Tooltip>
          ) : (
            <Tooltip title="Desactivar miembro">
              <IconButton icon={<TbCancel/>} danger small onClick={() => disableMember(uuid)}/>
            </Tooltip>
          )}
          <IconButton
            icon={<PiIdentificationCard/>}
            onClick={() => {
              getCredential(row);
            }}
            small
          />
        </Space>
      ),
    },
  ];

  const getCredential = (subscription: SubscriptionMember) => {
    setOpenPrint(true);
    setDownloading(true);
    axios({
      url: 'subscriptions/credentials/' + subscription?.uuid,
      method: 'GET',
      params: {
        use_watermark: pdfWatermark ? '1' : '0',
        template: carnetTemplate,
      },
      responseType: 'blob', // important
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(response.data);
          setTempURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader
        onEdit={() => {
          setOpenEditSubscription(true);
          setSelectedSubscription(subscription);
        }}
        onRefresh={() => setReload(!reload)}
        title={'Socio ' + subscription?.code}
        showBack
        tools={
          <Space>
            <Tag color={subscription?.is_active ? 'green' : 'red'}>
              {subscription?.is_active ? 'ACTIVO' : 'SUSPENDIDO'}
            </Tag>
          </Space>
        }>
        <Space separator={<Divider orientation={'vertical'}/>}>
          <InfoButton
            icon={<TbCalendarUp className={'icon'}/>}
            caption={dayjs(subscription?.started_at).format(Config.dateFormatUser)}
            label={'Inicio'}
          />
          {subscription?.terminated_at ?
            <InfoButton
              icon={<PiCalendarX className={'icon'}/>}
              caption={dayjs(subscription?.terminated_at).format(Config.dateFormatUser)}
              label={'Fin'}
            /> :
            <PrimaryButton icon={<TbCalendarX size={18}/>} disabled ghost danger label={'Terminar membresía'}/>
          }
          <InfoButton
            label={'Precio del plan'}
            onEdit={() => {
              navigate(`/commercial/contracts/${subscription?.contract_uuid}`)
            }}
            icon={<TbReceipt2 className={'icon'}/>}
            caption={<MoneyString value={subscription?.amount || subscription?.contract?.totals?.PEN}
                                  currency={subscription?.billing_currency}/>}
          />
          <div>
            <span>Marca de agua</span> <br/>
            <Switch
              size={'small'}
              defaultValue={pdfWatermark}
              onChange={value => {
                setPdfWatermark(value);
                localStorage.setItem('field_watermark', value ? '1' : '0');
              }}
            />
          </div>
          <div>
            <Select
              defaultValue={carnetTemplate}
              placeholder={'Plantilla'}
              style={{width: 150}}
              onChange={value => {
                setCarnetTemplate(value);
                localStorage.setItem('field_template', value);
              }}
              options={[
                {value: 'ilo', label: 'Carnet Ilo'},
                {value: 'moquegua', label: 'Carnet Moquegua'},
              ]}
              size={'small'}
            />
          </div>
        </Space>
        <div style={{padding: '10px 0'}}>{subscription?.observations || 'Sin observaciones'}</div>
      </ContentHeader>
      <Row gutter={[20, 20]}>
        <Col xs={16}>
          <Divider>
            <Space>
              Miembros
              <PrimaryButton
                icon={<PiPlusBold size={16}/>}
                label={'Agregar miembro'}
                onClick={() => {
                  setOpenAddMember(true);
                  setSelectedSubscription(subscription);
                }}
                size={'small'}
              />
            </Space>
          </Divider>
          <TableList loading={loading} columns={columns} dataSource={subscription?.members}/>
          <Divider>Pagos</Divider>
          {subscription?.contract &&
            <InvoicesTable
              contract={subscription.contract}

            />
          }
        </Col>
        <Col xs={8}>
          <h3>Actividad</h3>
          {subscription &&
            <EntityActivityManager uuid={subscription.uuid} type={'subscription'}/>
          }
        </Col>
      </Row>
      <Modal
        destroyOnHidden
        title={'Agregar miembro'}
        footer={false}
        open={openAddMember}
        onCancel={() => {
          setOpenAddMember(false);
        }}>
        {selectedSubscription && (
          <AddMemberSubscription
            onComplete={() => {
              setOpenAddMember(false);
              setSelectedSubscription(undefined);
              setReload(!reload);
            }}
            subscription={selectedSubscription}
          />
        )}
      </Modal>
      <Modal
        destroyOnHidden
        footer={false}
        open={openEditSubscription}
        onCancel={() => {
          setOpenEditSubscription(false);
        }}>
        {selectedSubscription && (
          <SubscriptionForm
            onComplete={() => {
              setOpenEditSubscription(false);
              setSelectedSubscription(undefined);
              setReload(!reload);
            }}
            subscription={selectedSubscription}
          />
        )}
      </Modal>
      <Modal
        width={800}
        destroyOnHidden
        title={'Editar datos'}
        footer={false}
        open={!!selectedProfile}
        onCancel={() => {
          setSelectedProfile(undefined);
        }}>
        {selectedProfile && <ProfileEditor profileUuid={selectedProfile.uuid}/>}
      </Modal>
      <Modal
        destroyOnHidden
        title={'Carnet de socio'}
        footer={false}
        open={openPrint}
        onCancel={() => {
          setOpenPrint(false);
          setTempURL(undefined);
        }}>
        <LoadingIndicator visible={downloading}/>
        {tempURL && <iframe src={tempURL} height={600} width={'100%'} style={{border: 0}}></iframe>}
      </Modal>
    </ModuleContent>
  );
}

export default ClubSubscription;
