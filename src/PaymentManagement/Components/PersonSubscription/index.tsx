import React, {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/16/solid';
import {CreditCardIcon} from '@heroicons/react/24/solid';
import {PencilIcon} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import {Collapse, Modal, Space, Tag} from 'antd';
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
import Invoices from '../../Screens/Invoices';
import InvoiceTableDetails from '../InvoiceTableDetails';
import InvoicesTable from '../InvoicesTable';

interface PersonSubscriptionProps {
  profileUuid: string;
}

const PersonSubscription = ({profileUuid}: PersonSubscriptionProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [tempURL, setTempURL] = useState<string>();
  const [selectedProfile, setSelectedProfile] = useState<Profile>();

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
  }, [profileUuid]);

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
          <IconButton icon={<PencilIcon />} onClick={() => setSelectedProfile(row.profile)} small />
          <IconButton icon={<TrashIcon />} danger small />
          <IconButton
            icon={<CreditCardIcon />}
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
      <Collapse defaultActiveKey={0}>
        {subscriptions?.map((subscription: Subscription) => (
          <Collapse.Panel
            key={subscription.uuid}
            extra={
              <>
                {subscription.is_active ? 'Activo' : 'Suspendido'}
                <Tag>{subscription.code}</Tag>
              </>
            }
            header={
              <>
                {subscription.plan.name}{' '}
                <Tag color={'blue'}>
                  <TextMoney money={subscription.plan.price} currency={subscription.billing_currency} />
                </Tag>
                {''}/{' '}
                <Tag color={'blue'}>
                  <TextMoney money={subscription.amount} currency={subscription.billing_currency} />
                </Tag>
              </>
            }>
            <>
              <strong>Inicio: </strong>
              {dayjs(subscription.started_at).format('DD/MM/YYYY hh:mm a')} <br />
              <strong>Final: </strong>
              {subscription.terminated_at
                ? dayjs(subscription.terminated_at).format('DD [de] MMMM [del] YYYY [a las] hh:mm a') +
                  ' - ' +
                  dayjs(subscription.started_at).diff(new Date(), 'days')
                : 'Indefinido'}
            </>
            <h3>Miembros</h3>
            <TableList loading={loading} columns={columns} dataSource={subscription.members} />
            <h3>Pagos</h3>
            <InvoicesTable entityUuid={subscription.uuid} />
          </Collapse.Panel>
        ))}
      </Collapse>
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
