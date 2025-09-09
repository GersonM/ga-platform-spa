import {useEffect, useState} from 'react';
import {
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Pagination,
  Popconfirm,
  Popover,
  Space,
  Tag,
  Tooltip
} from 'antd';
import {NavLink, useNavigate} from 'react-router-dom';
import {TbContract, TbTrash} from "react-icons/tb";
import dayjs from "dayjs";
import axios from 'axios';

import type {Contract, EntityActivity, Profile, Subscription} from '../../../Types/api';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import TableList from '../../../CommonUI/TableList';
import MoneyString from '../../../CommonUI/MoneyString';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import ProfileDocument from '../../../CommonUI/ProfileTools/ProfileDocument';
import FilterForm from '../../../CommonUI/FilterForm';
import IconButton from '../../../CommonUI/IconButton';
import {LuCircleChevronRight} from "react-icons/lu";
import NewSubscriptionForm from "../../Components/NewSubscriptionForm";
import StorageStockChip from "../../../Commercial/Components/StorageStockChip";

const ClubMembersManagement = () => {
  const [openAddSubscription, setOpenAddSubscription] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [filters, setFilters] = useState<any>();
  const [pagination, setPagination] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        page: currentPage,
        page_size: pageSize,
        ...filters
      },
    };

    setLoading(true);
    axios
      .get(`subscriptions`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setSubscriptions(response.data.data);
          setPagination(response.data.meta);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, pageSize, currentPage, filters]);

  const deleteSubscription = (uuid: string) => {
    setLoading(true);
    axios.delete(`subscriptions/${uuid}`)
      .then(() => {
        setLoading(false);
        setReload(!reload);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      })
  }

  const columns = [
    {
      dataIndex: 'code',
      title: 'N°',
      align: 'center',
      width: 70,
      render: (code: string, row: Subscription) => {
        return <Tag color={row.is_active ? 'green' : 'red'} bordered={false}>
          <code>{code}</code>
        </Tag>;
      },
    },
    {
      dataIndex: 'contract',
      title: 'Plan',
      width: 140,
      render: (contract?: Contract) => {
        if (!contract?.cart?.length) {
          return <small>Sin productos</small>;
        }
        return <Popover content={<div>
          <Space direction={'vertical'} split={<Divider style={{margin: '5px 0'}}/>}>
            {contract.cart?.map((cI, index) => {
              return <StorageStockChip key={index} storageStock={cI.stock} quantity={cI.quantity}/>
            })}
          </Space>
        </div>}>
          <StorageStockChip storageStock={contract.cart[0].stock} quantity={contract.cart[0].quantity}/>
          {contract.cart.length > 1 && <Tag bordered={false}>(...{contract.cart.length - 1} más)</Tag>}
        </Popover>
      }
    },
    {
      title: 'Socio desde',
      dataIndex: 'started_at',
      width: 110,
      render: (started_at: string) => {
        return started_at ? dayjs(started_at).fromNow() : '-';
      },
    },
    {
      dataIndex: 'contract',
      title: 'Monto',
      align: 'right',
      width: 100,
      render: (contract?: Contract) => (
        contract ? <MoneyString value={contract.totals?.PEN}/> : '-'
      ),
    },
    {dataIndex: 'holder_profile', title: 'Titular', render: (profile: Profile) => <ProfileChip profile={profile}/>},
    {
      dataIndex: 'holder_profile',
      width: 120,
      title: 'Documento',
      render: (profile: Profile) => <ProfileDocument profile={profile}/>
    },
    {
      dataIndex: 'activity',
      title: 'Actividad',
      width: 180,
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
      width: 110,
      render: (uuid: string, row: Subscription) => (
        <>
          <Popconfirm
            onConfirm={() => deleteSubscription(uuid)}
            title={'¿Seguro que quiere borrar esta subscripción?'}
            description={'Esta acción no se puede revertir y se eliminará toda la información relacionada a esta subscripción'}>
            <IconButton icon={<TbTrash/>} danger small/>
          </Popconfirm>
          {row.contract_uuid &&
            <Tooltip title={'Contrato: ' + row.contract?.tracking_id}>
              <NavLink to={'/commercial/contracts/' + row.contract_uuid}>
                <IconButton icon={<TbContract/>}/>
              </NavLink>
            </Tooltip>
          }
          <IconButton
            title={'Ver detalles'}
            icon={<LuCircleChevronRight/>}
            onClick={() => {
              navigate('/club/subscriptions/' + uuid);
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
          onInitialValues={values => setFilters(values)}
          onSubmit={values => setFilters(values)}>
          <Form.Item name={'search'} label={'Buscar'}>
            <Input allowClear placeholder={'Nombre o dni del titular'}/>
          </Form.Item>
          <Form.Item name={'code'} label={'Código'}>
            <Input allowClear placeholder={'N° de socio'}/>
          </Form.Item>
          <Form.Item name={'pending_payments'} label={'Cuotas vencidas'}>
            <InputNumber placeholder={'Todos'}/>
          </Form.Item>
        </FilterForm>
      </ContentHeader>

      <TableList scroll={{x: 900}} customStyle={false} columns={columns} dataSource={subscriptions}/>
      <Pagination
        align={'center'}
        style={{marginTop: 10}}
        showSizeChanger={false}
        total={pagination?.total}
        pageSize={pagination?.per_page}
        current={pagination?.current_page}
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
      />

      <Modal
        title={'Nuevo socio'}
        width={900}
        open={openAddSubscription}
        destroyOnHidden
        onCancel={() => setOpenAddSubscription(false)}
        footer={null}>
        <NewSubscriptionForm onComplete={() => {
          setOpenAddSubscription(false);
          setReload(!reload);
          notification.success({message: 'Socio agregado'});
        }}/>
      </Modal>
    </ModuleContent>
  );
};

export default ClubMembersManagement;
