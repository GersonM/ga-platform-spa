import React, {useEffect, useState} from 'react';
import {Button, Drawer, Empty, Popover, Select, Space} from 'antd';
import {SiCpanel, SiGmail} from 'react-icons/si';
import {ChartPieIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import {MailAccount, MailProvider} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateProvider from './CreateProvider';
import FileSize from '../../../CommonUI/FileSize';
import MailBackupManager from '../../Components/MailBackupManager';
import TableList from '../../../CommonUI/TableList';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {PlusIcon} from '@heroicons/react/24/solid';

const ConfigProviders = () => {
  const [providers, setProviders] = useState<MailProvider[]>();
  const [reload, setReload] = useState(false);
  const [reloadAccounts, setReloadAccounts] = useState(false);
  const [accounts, setAccounts] = useState<MailAccount[]>();
  const [selectedProvider, setSelectedProvider] = useState<MailProvider>();
  const [selectedAccount, setSelectedAccount] = useState<MailAccount>();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`inbox-management/providers`, config)
      .then(response => {
        if (response) {
          setProviders(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  useEffect(() => {
    if (selectedProvider) {
      setLoading(true);
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`inbox-management/providers/${selectedProvider.uuid}/accounts`, config)
        .then(response => {
          setLoading(false);
          if (response) {
            setAccounts(response.data);
            if (selectedAccount) {
              setSelectedAccount(response.data.find((a: any) => a.uuid === selectedAccount.uuid));
            }
          }
        })
        .catch(e => {
          setLoading(false);
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [selectedProvider, reloadAccounts]);

  const syncProvider = () => {
    if (!selectedProvider) {
      return;
    }
    setSyncing(true);
    axios
      .post(`inbox-management/providers/${selectedProvider?.uuid}/sync`)
      .then(response => {
        setSyncing(false);
        if (response) {
          setReload(!reload);
          setReloadAccounts(!reloadAccounts);
        }
      })
      .catch(e => {
        setSyncing(false);
        ErrorHandler.showNotification(e);
      });
  };

  const onProviderSelected = (item: string) => {
    setSelectedProvider(providers?.find(p => p.uuid === item));
  };

  const columns = [
    {title: 'Nombre', dataIndex: 'contact_name'},
    {title: 'Correo', dataIndex: 'address'},
    {title: 'Restringido', dataIndex: 'is_disabled', render: (value: boolean) => (value ? 'Si' : 'No')},
    {
      title: 'Configurado',
      dataIndex: 'setup_completed',
      render: (value: boolean) => (value ? 'Si' : 'No'),
    },
    {
      title: 'Tamaño respaldo',
      dataIndex: 'space_used',
      render: (value: number) => <FileSize size={value} binary={true} />,
    },
    {
      title: 'Bandeja de entrada',
      dataIndex: 'space_assigned',
      render: (value: any, r: any) => (
        <>
          <FileSize size={r.space_used} binary={true} /> /{' '}
          {value === 0 ? 'Sin límite' : <FileSize size={value} binary={true} />}
        </>
      ),
    },
    {
      title: '',
      render: (id: any, account: any) => (
        <Button
          size={'small'}
          type={'primary'}
          ghost
          onClick={() => setSelectedAccount(account)}
          icon={<ChartPieIcon className={'button-icon'} />}>
          Liberar espacio
        </Button>
      ),
    },
  ];
  return (
    <>
      <Space>
        <Select style={{width: 220}} placeholder={'Elige un proveedor de correo'} onChange={onProviderSelected}>
          {providers?.map(p => (
            <Select.Option key={p.uuid} value={p.uuid}>
              {p.name} ({p.num_accounts} cuentas)
            </Select.Option>
          ))}
        </Select>
        <Popover trigger={['click']} content={<CreateProvider onFinish={() => setReload(!reload)} />}>
          <PrimaryButton icon={<PlusIcon />}>Registrar proveedor</PrimaryButton>
        </Popover>
        <Button
          type={'primary'}
          loading={syncing}
          icon={<span className={'icon-sync button-icon'} />}
          disabled={!selectedProvider}
          ghost
          onClick={syncProvider}>
          Sincronizar
        </Button>
        <Button
          type={'primary'}
          loading={loading}
          icon={<span className={'icon-redo2 button-icon'} />}
          disabled={!selectedProvider}
          ghost
          onClick={() => setReloadAccounts(!reloadAccounts)}>
          Actualizar
        </Button>
      </Space>
      {selectedProvider && (
        <>
          <div className={'item-mail-provider'}>
            <div className="logo">
              {selectedProvider.type === 'cpanel' && <SiCpanel className={'icon cpanel'} />}
              {selectedProvider.type === 'gmail' && <SiGmail className={'icon gmail'} />}
            </div>
            <div>
              <h3 className={'title'}>{selectedProvider.name}</h3>({selectedProvider.username}) -{' '}
              {selectedProvider.host} | {selectedProvider.num_accounts} Accounts
            </div>
          </div>
          <TableList pagination={false} rowKey={'uuid'} dataSource={accounts} columns={columns} />
        </>
      )}
      {!selectedProvider && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Seleccionar un proveedor para ver las cuentas'} />
      )}
      <Drawer
        destroyOnClose
        open={!!selectedAccount}
        title={'Backup de cuenta'}
        onClose={() => setSelectedAccount(undefined)}>
        {selectedAccount && (
          <MailBackupManager
            onChange={() => {
              setReloadAccounts(!reloadAccounts);
            }}
            mailAccount={selectedAccount}
          />
        )}
      </Drawer>
    </>
  );
};

export default ConfigProviders;
