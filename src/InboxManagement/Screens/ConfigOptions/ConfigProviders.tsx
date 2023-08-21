import React, {useEffect, useState} from 'react';
import {Button, Drawer, Empty, Popover, Select, Space, Table} from 'antd';
import {SiCpanel, SiGmail} from 'react-icons/si';
import {ChartPieIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import {MailAccount, MailProvider} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateProvider from './CreateProvider';
import FileSize from '../../../CommonUI/FileSize';
import MailBackupManager from '../../Components/MailBackupManager';

const ConfigProviders = () => {
  const [providers, setProviders] = useState<MailProvider[]>();
  const [reload, setReload] = useState(false);
  const [reloadAccounts, setReloadAccounts] = useState(false);
  const [accounts, setAccounts] = useState<MailAccount[]>();
  const [selectedProvider, setSelectedProvider] = useState<MailProvider>();
  const [selectedAccount, setSelectedAccount] = useState<MailAccount>();

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
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`inbox-management/providers/${selectedProvider.uuid}/accounts`, config)
        .then(response => {
          if (response) {
            setAccounts(response.data);
            if (selectedAccount) {
              setSelectedAccount(response.data.find((a: any) => a.uuid === selectedAccount.uuid));
            }
          }
        })
        .catch(e => {
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [selectedProvider, reloadAccounts]);

  const syncProvider = () => {
    if (!selectedProvider) {
      return;
    }
    axios
      .post(`inbox-management/providers/${selectedProvider?.uuid}/sync`)
      .then(response => {
        if (response) {
          setReload(!reload);
          setReloadAccounts(!reloadAccounts);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const onProviderSelected = (item: string) => {
    setSelectedProvider(providers?.find(p => p.uuid === item));
  };

  const columns = [
    {title: 'Nombre de contact', dataIndex: 'contact_name'},
    {title: 'Dirección de correo', dataIndex: 'address'},
    {
      title: 'Configurado',
      dataIndex: 'setup_completed',
      render: (value: boolean) => (value ? 'Si' : 'No'),
    },
    {
      title: 'Mensajes',
      dataIndex: 'space_assigned',
    },
    {
      title: 'Tamaño respaldo',
      dataIndex: 'space_used',
      render: (value: any) => <FileSize size={value} binary={true} />,
    },
    {
      title: 'Bandeja de entrada',
      dataIndex: 'space_assigned',
      render: (value: any, r: any) => (
        <>
          <FileSize size={r.space_used} binary={true} /> / <FileSize size={value} binary={true} />
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
          <Button ghost type={'primary'} icon={<span className={'icon-plus button-icon'} />}>
            Registrar proveedor
          </Button>
        </Popover>
        <Button
          type={'primary'}
          icon={<span className={'icon-sync button-icon'} />}
          disabled={!selectedProvider}
          ghost
          onClick={syncProvider}>
          Sincronizar
        </Button>
        <Button
          type={'primary'}
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
          <Table pagination={false} rowKey={'uuid'} size={'small'} dataSource={accounts} columns={columns} />
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
