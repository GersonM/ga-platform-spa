import React, {useEffect, useState} from 'react';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import {Plan, Subscription} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import dayjs from 'dayjs';
import TextMoney from '../../../CommonUI/TextMoney';

interface PersonSubscriptionProps {
  profileUuid: string;
}

const PersonSubscription = ({profileUuid}: PersonSubscriptionProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [loading, setLoading] = useState(false);

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
      title: 'Plan',
      dataIndex: 'plan',
      width: 200,
      render: (plan: Plan, row: Subscription) => (
        <>
          <strong>{plan.name}</strong> <br />
          <small>
            <TextMoney money={plan.price} currency={row.billing_currency} />
          </small>
        </>
      ),
    },
    {
      title: 'Fechas',
      dataIndex: 'started_at',
      width: 440,
      render: (date: string, row: Subscription) => (
        <>
          <strong>Inicio: </strong>
          {dayjs(date).format('DD [de] MMMM [del] YYYY [a las] hh:mm a')} <br />
          <strong>Final: </strong>
          {dayjs(row.terminated_at).format('DD [de] MMMM [del] YYYY [a las] hh:mm a')}
        </>
      ),
    },
    {
      title: 'Tiempo restante',
      dataIndex: 'terminated_at',
      width: 180,
      render: (date: string, row: Subscription) => {
        const days = dayjs(date).diff(new Date(), 'days');
        return days < 0 ? 'Terminado' : `${days} días restantes`;
      },
    },
    {
      title: 'Periodo',
      dataIndex: 'billing_period',
      width: 200,
    },
    {
      title: 'Renovación automática',
      dataIndex: 'automatic_renew',
      width: 180,
    },
    {
      title: 'Activo',
      dataIndex: 'is_active',
      width: 110,
      render: (isActive: boolean) => (isActive ? 'Si' : 'No'),
    },
  ];

  return (
    <div>
      <TableList loading={loading} columns={columns} dataSource={subscriptions} />
    </div>
  );
};

export default PersonSubscription;
