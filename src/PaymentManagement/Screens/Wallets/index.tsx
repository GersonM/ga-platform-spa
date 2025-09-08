import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Form, Popconfirm, Space} from 'antd';
import {TbArrowsRightLeft, TbPencil, TbTrash} from "react-icons/tb";
import dayjs from 'dayjs';

import type {Wallet} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import ModuleContent from '../../../CommonUI/ModuleContent';
import TableList from '../../../CommonUI/TableList';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import MoneyString from '../../../CommonUI/MoneyString';
import CompanyChip from "../../../HRManagement/Components/CompanyChip";
import FilterForm from "../../../CommonUI/FilterForm";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import {ClientSelector} from "../../Components/ClientSelector";
import ModalView from "../../../CommonUI/ModalView";
import WalletForm from "../../Components/WalletForm";

const Wallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [filters, setFilters] = useState<any>();
  const [openWalletForm, setOpenWalletForm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();


  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {},
    };
    setLoading(true);
    axios
      .get(`payment-management/wallets`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setWallets(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, filters]);

  const deleteInvoice = (uuid: string) => {
    axios
      .delete('payment-management/invoices/' + uuid)
      .then(() => {
        setReload(!reload);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  const columns: any = [
    {
      title: 'Tipo',
      dataIndex: 'type',
    },
    {
      title: 'Entidad',
      dataIndex: 'bank_name',
    },
    {
      title: 'N°/ID de cuenta',
      dataIndex: 'account_number',
      render: (account_number: string) => <code>{account_number}</code>,
    },
    {
      title: 'CCI',
      dataIndex: 'international_account_number',
      render: (international_account_number: string) => <code>{international_account_number}</code>,
    },
    {
      title: 'F. apertura',
      width: 110,
      dataIndex: 'issued_at',
      render: (date: string) => <code>{date ? dayjs(date).format('DD/MM/YYYY') : ''}</code>,
    },
    {
      title: 'País',
      width: 60,
      dataIndex: 'country_code',
    },
    {
      title: 'Moneda',
      dataIndex: 'currency',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      render: (balance: number, wallet: Wallet) => {
        return <MoneyString currency={wallet.currency} value={balance}/>;
      }
    },
    {
      title: 'Propietario',
      dataIndex: 'holder',
      render: (holder: any, w: Wallet) => {
        return w.holder_type.includes('Profile') ?
          <ProfileChip profile={holder}/> :
          <CompanyChip company={holder}/>;
      }
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 75,
      render: (uuid: string, row: Wallet) => (
        <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedWallet(row);
            setOpenWalletForm(true);
          }}/>
          <IconButton title={'Ver movimientos'} small icon={<TbArrowsRightLeft/>} onClick={() => {
            setSelectedWallet(row);
            setOpenWalletForm(true);
          }}/>
          <Popconfirm
            title={'¿Quiere eliminar esta factura?'}
            onConfirm={() => deleteInvoice(uuid)}
            okText={'Si'}
            cancelText={'No'}>
            <IconButton small danger icon={<TbTrash/>}/>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <>
      <ModuleContent>
        <ContentHeader
          title={'Cuentas'}
          loading={loading}
          onRefresh={() => setReload(!reload)}
          onAdd={() => setOpenWalletForm(true)}>
          <FilterForm onSubmit={values => setFilters(values)}>
            <Form.Item label={'Cliente'} name={'client_uuid'}>
              <ClientSelector/>
            </Form.Item>
          </FilterForm>
        </ContentHeader>
        <TableList scroll={{x: 1000}} customStyle={false} columns={columns} dataSource={wallets}/>
      </ModuleContent>
      <ModalView
        onCancel={() => {
          setOpenWalletForm(false);
        }} open={openWalletForm}>
        <WalletForm wallet={selectedWallet} onComplete={() => setReload(!reload)}/>
      </ModalView>
    </>
  );
};

export default Wallets;
