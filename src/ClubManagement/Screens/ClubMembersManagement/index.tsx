import React, {useEffect, useState} from 'react';
import {Form, Input, Modal, Select} from 'antd';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import SubscriptionForm from '../../Components/SubscriptionForm';
import axios from 'axios';
import {Plan, Profile, Subscription} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import TableList from '../../../CommonUI/TableList';
import MoneyString from '../../../CommonUI/MoneyString';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import FilterForm from '../../../CommonUI/FilterForm';
import IconButton from '../../../CommonUI/IconButton';
import {PiEye} from 'react-icons/pi';
import {useNavigate} from 'react-router-dom';

const ClubMembersManagement = () => {
  const [openAddSubscription, setOpenAddSubscription] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [codeFilter, setCodeFilter] = useState<string>();
  const [searchFilter, setSearchFilter] = useState<string>();
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {code: codeFilter, search: searchFilter},
    };

    axios
      .get(`subscriptions`, config)
      .then(response => {
        if (response) {
          setSubscriptions(response.data.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, codeFilter, searchFilter]);

  const columns = [
    {dataIndex: 'code', title: 'Código'},
    {
      dataIndex: 'plan',
      title: 'Plan',
      render: (plan?: Plan) => plan?.name,
    },
    {
      dataIndex: 'amount',
      title: 'Monto',
      render: (amount: number, row: Subscription) => (
        <>{amount ? <MoneyString value={amount} /> : <MoneyString value={row.plan.price} />}</>
      ),
    },
    {dataIndex: 'profile', title: 'Titular', render: (profile: Profile) => <ProfileChip profile={profile} />},
    {dataIndex: 'profile', title: 'Documento', render: (profile: Profile) => <ProfileDocument profile={profile} />},
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
            if (values?.code) setCodeFilter(values.payments);
          }}
          onSubmit={values => {
            setSearchFilter(values.payments);
            setCodeFilter(values?.code);
          }}>
          <Form.Item name={'search'} label={'Buscar'}>
            <Input allowClear placeholder={'Buscar por nombre, dni o correo'} />
          </Form.Item>
          <Form.Item name={'code'} label={'Código'}>
            <Input allowClear placeholder={'N° de socio'} />
          </Form.Item>
        </FilterForm>
      </ContentHeader>

      <TableList columns={columns} dataSource={subscriptions} />
      <Modal open={openAddSubscription} destroyOnClose onCancel={() => setOpenAddSubscription(false)} footer={null}>
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
