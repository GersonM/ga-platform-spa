import React, {useEffect, useState} from 'react';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {InvoicePayment, PaymentMethod} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import {Pagination} from 'antd';
import dayjs from 'dayjs';

interface ProfilePaymentsProps {
  profileUuid: string;
}

const ProfilePayments = ({profileUuid}: ProfilePaymentsProps) => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<InvoicePayment[]>();
  const [pagination, setPagination] = useState<any>();
  const [reload, setReload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {profile_uuid: profileUuid, page: currentPage},
    };
    setLoading(true);
    axios
      .get(`payment-management/payments`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setPayments(response.data.data);
          setPagination(response.data.meta);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, profileUuid, currentPage]);

  const columns = [
    {
      title: 'Voucher',
      dataIndex: 'voucher_code',
    },
    {
      title: 'Monto',
      dataIndex: 'amount_string',
    },
    {
      title: 'Transacción',
      dataIndex: 'transaction_info',
      render: (info: string) => {
        if (info) {
          try {
            const data = JSON.parse(info);
            const startTimeMillis = dayjs(parseInt(data.startTimeMillis));
            const expiryTimeMillis = dayjs(parseInt(data.expiryTimeMillis));
            return (
              <div>
                Inicio: {startTimeMillis.format('DD-MM-YYYY HH:mm a')} <br />
                Fin: {expiryTimeMillis.format('DD-MM-YYYY HH:mm a')} <br />
              </div>
            );
          } catch (err) {
            return info;
          }
        } else {
          return <small>No additional data</small>;
        }
      },
    },
    {
      title: '',
      dataIndex: 'transaction_info',
      render: (info: string) => {
        if (info) {
          try {
            const data = JSON.parse(info);
            const startTimeMillis = dayjs(parseInt(data.startTimeMillis));
            const expiryTimeMillis = dayjs(parseInt(data.expiryTimeMillis));
            return (
              <div>
                Precio: {data.priceAmountMicros / 1000000} {data.priceCurrencyCode} <br />
                Vence: {expiryTimeMillis.from(startTimeMillis)}
              </div>
            );
          } catch (e) {
            return info;
          }
        } else {
          return <small>No additional data</small>;
        }
      },
    },
    {
      title: 'Método de pago',
      dataIndex: 'method',
      render: (method: PaymentMethod) => {
        return (
          <div>
            {method.issuer} - {method.name}
          </div>
        );
      },
    },
    {
      title: 'Creado',
      dataIndex: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
  ];

  return (
    <div>
      <TableList columns={columns} dataSource={payments} loading={loading} />
      <Pagination
        showSizeChanger={false}
        size={'small'}
        total={pagination?.total}
        pageSize={pagination?.per_page}
        current={pagination?.current_page}
        onChange={(page, size) => {
          setCurrentPage(page);
        }}
      />
    </div>
  );
};

export default ProfilePayments;
