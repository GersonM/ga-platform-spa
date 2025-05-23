import React, {useEffect, useState} from 'react';
import {Form, Input, InputNumber, Modal, Pagination} from 'antd';
import {PiEye} from 'react-icons/pi';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import SubscriptionForm from '../../Components/SubscriptionForm';
import {EntityActivity, Plan, Profile, Subscription} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import TableList from '../../../CommonUI/TableList';
import MoneyString from '../../../CommonUI/MoneyString';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import FilterForm from '../../../CommonUI/FilterForm';
import IconButton from '../../../CommonUI/IconButton';
import './styles.less';

const ClubMembersManagement = () => {
  const [openAddSubscription, setOpenAddSubscription] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [codeFilter, setCodeFilter] = useState<string>();
  const [searchFilter, setSearchFilter] = useState<string>();
  const [paymentsFilter, setPaymentsFilter] = useState<number>();
  const [pagination, setPagination] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        code: codeFilter,
        search: searchFilter,
        page: currentPage,
        page_size: pageSize,
        pending_payments: paymentsFilter,
      },
    };

    axios
      .get(`subscriptions`, config)
      .then(response => {
        if (response) {
          setSubscriptions(response.data.data);
          setPagination(response.data.meta);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, codeFilter, searchFilter, pageSize, currentPage, paymentsFilter]);

  const columns = [
    {
      dataIndex: 'code',
      title: 'Código',
      width: 60,
      render: (code: string, row: Subscription) => {
        return <div className={row.is_active ? 'subscription-active' : 'subscription-inactive'}>{code}</div>;
      },
    },
    {
      dataIndex: 'plan',
      title: 'Plan',
      width: 120,
      render: (plan?: Plan) => plan?.name,
    },
    {
      dataIndex: 'amount',
      title: 'Monto',
      width: 90,
      render: (amount: number, row: Subscription) => (
        <>{amount ? <MoneyString value={amount} /> : <MoneyString value={row.plan.price} />}</>
      ),
    },
    {dataIndex: 'profile', title: 'Titular', render: (profile: Profile) => <ProfileChip profile={profile} />},
    {dataIndex: 'profile', title: 'Documento', render: (profile: Profile) => <ProfileDocument profile={profile} />},
    {
      dataIndex: 'activity',
      title: 'Actividad',
      render: (activity: EntityActivity) => {
        return (
          activity && (
            <div style={{lineHeight: '14px'}}>
              <div>{activity?.comment}</div>
              <small>por {activity?.profile?.name}</small>
            </div>
          )
        );
      },
    },
    {
      dataIndex: 'uuid',
      title: 'Acciones',
      render: (_uuid: string, row: any) => (
        <>
          <IconButton
            title={'Ver detalles'}
            icon={<PiEye size={18} />}
            onClick={() => {
              navigate('/club/subscriptions/' + row.profile.uuid);
            }}
          />
        </>
      ),
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader onRefresh={() => setReload(!reload)} title={'Socios'} onAdd={() => setOpenAddSubscription(true)}>
        <FilterForm
          onInitialValues={values => {
            if (values?.search) setSearchFilter(values.search);
            if (values?.code) setCodeFilter(values.code);
            if (values?.pending_payments) setPaymentsFilter(values.pending_payments);
          }}
          onSubmit={values => {
            setSearchFilter(values.search);
            setCodeFilter(values?.code);
            setPaymentsFilter(values?.pending_payments);
          }}>
          <Form.Item name={'search'} label={'Buscar'}>
            <Input allowClear placeholder={'Nombre o dni del titular'} />
          </Form.Item>
          <Form.Item name={'code'} label={'Código'}>
            <Input allowClear placeholder={'N° de socio'} />
          </Form.Item>
          <Form.Item name={'pending_payments'} label={'Cuotas vencidas'}>
            <InputNumber placeholder={'Todos'} />
          </Form.Item>
        </FilterForm>
      </ContentHeader>

      <TableList columns={columns} dataSource={subscriptions} />
      <Pagination
        showSizeChanger={false}
        size={'small'}
        total={pagination?.total}
        pageSize={pagination?.per_page}
        current={pagination?.current_page}
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
      />

      <Modal
        title={'Editar subscripción'}
        open={openAddSubscription}
        destroyOnClose
        onCancel={() => setOpenAddSubscription(false)}
        footer={null}>
        <SubscriptionForm
          onComplete={() => {
            setOpenAddSubscription(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </ModuleContent>
  );
};

export default ClubMembersManagement;
