import React, {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/16/solid';
import {CreditCardIcon} from '@heroicons/react/24/solid';
import {PencilIcon} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import {Divider, Empty, Modal, Space, Switch, Tag, Tooltip} from 'antd';
import {
  PiCalendarCheck,
  PiCalendarX,
  PiCheck,
  PiCodeBlock,
  PiIdentificationCard,
  PiPencil,
  PiPencilSimple,
  PiProhibit,
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
import './styles.less';

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
  const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [reload, setReload] = useState(false);

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

  const columns = [
    {
      title: 'Nombres',
      dataIndex: 'profile',
      render: (profile: Profile) => <ProfileChip profile={profile} />,
    },
    {
      title: 'Documento',
      dataIndex: 'profile',
      width: 200,
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
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string, row: SubscriptionMember) => (
        <Space>
          <IconButton icon={<PiPencilSimple size={18} />} onClick={() => setSelectedProfile(row.profile)} small />
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
              console.log('asdadf');
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
            <div className={'subscription-info'}>
              <Space>
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
                      : 'Indefinido'
                  }
                  label={'Terminado'}
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
                  <Switch size={'small'} onChange={value => setPdfWatermark(value)} />
                </div>
              </Space>
            </div>
          </ContentHeader>
          <Divider orientation={'left'}>Miembros</Divider>
          <TableList loading={loading} columns={columns} dataSource={subscription.members} />
          <Divider orientation={'left'}>Pagos</Divider>
          <InvoicesTable entityUuid={subscription.uuid} />
          <Divider orientation={'left'}>Actividad</Divider>
          <EntityActivityManager uuid={subscription.uuid} type={'subscription'} />
        </div>
      ))}
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
