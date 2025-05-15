import React, {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/16/solid';
import dayjs from 'dayjs';
import {Card, Col, Divider, Empty, Modal, Popconfirm, Row, Select, Space, Switch, Tag, Tooltip} from 'antd';
import {
  PiCalendarCheck,
  PiCalendarX,
  PiIdentificationCard,
  PiPencilSimple,
  PiPlusBold,
  PiProhibitBold,
  PiThumbsUp,
  PiTicket,
} from 'react-icons/pi';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Profile, Subscription, SubscriptionMember} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import TextMoney from '../../../CommonUI/TextMoney';
import IconButton from '../../../CommonUI/IconButton';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ProfileEditor from '../../../AccountManagement/Components/ProfileEditor';
import InvoicesTable from '../InvoicesTable';
import InfoButton from '../../../CommonUI/InfoButton';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import EntityActivityManager from '../../../CommonUI/EntityActivityManager';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import AddMemberSubscription from '../AddMemberSubscription';

import './styles.less';
import SubscriptionForm from '../../../ClubManagement/Components/SubscriptionForm';
import FamilyRelationSelector from '../../../CommonUI/FamilyRelationSelector';

interface PersonSubscriptionProps {
  profileUuid: string;
}

const PersonSubscription = ({profileUuid}: PersonSubscriptionProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [tempURL, setTempURL] = useState<string>();
  const [pdfWatermark, setPdfWatermark] = useState(false);
  const [carnetTemplate, setCarnetTemplate] = useState<string>();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openEditSubscription, setOpenEditSubscription] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const template = localStorage.getItem('field_template');
    const watermark = localStorage.getItem('field_watermark');

    if (template) {
      setCarnetTemplate(template);
    }

    if (watermark) {
      setPdfWatermark(watermark === '1');
    }
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {profile_uuid: profileUuid},
    };
    setLoading(true);
    axios
      .get(`payment-management/subscriptions`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setSubscriptions(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [profileUuid, reload]);

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
      render: (profile: Profile) => <ProfileChip profile={profile} />,
    },
    {
      title: 'Documento',
      dataIndex: 'profile',
      width: 110,
      render: (profile: Profile) => <ProfileDocument profile={profile} />,
    },
    {
      title: 'Registrado',
      dataIndex: 'created_at',
      render: (created_at: string) => dayjs(created_at).format('DD/MM/YYYY hh:mm a'),
    },
    {
      title: 'Relación',
      align: 'center',
      dataIndex: 'relation_type',
      render: (relation: string, member: SubscriptionMember) => {
        return relation === 'SOCIO' ? (
          'Socio titular'
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
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string, row: SubscriptionMember) => (
        <Space>
          <IconButton icon={<PiPencilSimple size={18} />} onClick={() => setSelectedProfile(row.profile)} small />
          <Popconfirm
            title={'Eliminar miembro'}
            onConfirm={() => deleteMember(uuid)}
            description={'Esto no eliminará a la persona, solo su relación con esta subscripción'}>
            <IconButton danger icon={<TrashIcon />} small />
          </Popconfirm>
          {row.suspended_at ? (
            <Tooltip title="Activar miembro">
              <IconButton icon={<PiThumbsUp size={18} />} small onClick={() => enableMember(uuid)} />
            </Tooltip>
          ) : (
            <Tooltip title="Desactivar miembro">
              <IconButton icon={<PiProhibitBold size={18} />} danger small onClick={() => disableMember(uuid)} />
            </Tooltip>
          )}
          <IconButton
            icon={<PiIdentificationCard size={18} />}
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
    <div>
      {subscriptions?.length == 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay subscripciones para esta persona'} />
      )}
      {subscriptions?.map((subscription: Subscription) => (
        <div key={subscription.uuid}>
          <ContentHeader
            onEdit={() => {
              setOpenEditSubscription(true);
              setSelectedSubscription(subscription);
            }}
            onRefresh={() => setReload(!reload)}
            title={subscription.plan.name}
            tools={
              <Space>
                <Tag color={'blue'}>{subscription.code}</Tag>
                <Tag color={subscription.is_active ? 'green' : 'red'}>
                  {subscription.is_active ? 'ACTIVO' : 'SUSPENDIDO'}
                </Tag>
              </Space>
            }>
            <Space split={<Divider type={'vertical'} />}>
              <InfoButton
                icon={<PiCalendarCheck className={'icon'} />}
                caption={dayjs(subscription.started_at).format('DD/MM/YYYY hh:mm a')}
                label={'Inicio'}
              />
              <InfoButton
                icon={<PiCalendarX className={'icon'} />}
                caption={
                  subscription.terminated_at
                    ? dayjs(subscription.terminated_at).format('DD [de] MMMM [del] YYYY [a las] hh:mm a') +
                      ' - ' +
                      dayjs(subscription.started_at).diff(new Date(), 'days')
                    : 'Indeterminado'
                }
                label={'Fin'}
              />
              <InfoButton
                icon={<PiTicket className={'icon'} />}
                caption={<TextMoney money={subscription.amount} currency={subscription.billing_currency} />}
                label={'Subscripción'}
              />
              <InfoButton
                icon={<PiTicket className={'icon'} />}
                caption={<TextMoney money={subscription.plan.price} currency={subscription.billing_currency} />}
                label={'Plan'}
              />
              <div>
                <span>Marca de agua</span> <br />
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
          <Row gutter={[30, 30]}>
            <Col xs={16}>
              <Card
                title={'Miembros'}
                size={'small'}
                extra={
                  <PrimaryButton
                    icon={<PiPlusBold size={13} />}
                    label={'Agregar miembro'}
                    onClick={() => {
                      setOpenAddMember(true);
                      setSelectedSubscription(subscription);
                    }}
                    size={'small'}
                  />
                }>
                <TableList loading={loading} columns={columns} dataSource={subscription.members} />
              </Card>
              <Card title={'Pagos'} size={'small'} style={{marginTop: '10px'}}>
                <InvoicesTable entityUuid={subscription.uuid} type={'subscription'} />
              </Card>
              <br />
              <br />
            </Col>
            <Col xs={8}>
              <Divider orientation={'left'}>Actividad</Divider>
              <EntityActivityManager uuid={subscription.uuid} type={'subscription'} />
            </Col>
          </Row>
        </div>
      ))}
      <Modal
        destroyOnClose
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
        destroyOnClose
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
        destroyOnClose
        title={'Editar datos'}
        footer={false}
        open={!!selectedProfile}
        onCancel={() => {
          setSelectedProfile(undefined);
        }}>
        {selectedProfile && <ProfileEditor profileUuid={selectedProfile.uuid} />}
      </Modal>
      <Modal
        destroyOnClose
        title={'Carnet de socio'}
        footer={false}
        open={openPrint}
        onCancel={() => {
          setOpenPrint(false);
          setTempURL(undefined);
        }}>
        <LoadingIndicator visible={downloading} />
        {tempURL && <iframe src={tempURL} height={600} width={'100%'} frameBorder="0"></iframe>}
      </Modal>
    </div>
  );
};

export default PersonSubscription;
