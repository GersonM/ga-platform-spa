import {useEffect, useState} from 'react';
import {Button, Drawer, Empty, Modal, Select, Space} from 'antd';
import {SiCpanel, SiGmail, SiMaildotru} from 'react-icons/si';
import {ChartPieIcon} from '@heroicons/react/24/outline';
import {TbPlus} from "react-icons/tb";
import axios from 'axios';

import type {MailAccount, MailProvider} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateProvider from './CreateProvider';
import FileSize from '../../../CommonUI/FileSize';
import MailBackupManager from '../../Components/MailBackupManager';
import TableList from '../../../CommonUI/TableList';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import './styles.less';
import ModalView from "../../../CommonUI/ModalView";
import MailAccountForm from "../../Components/MailAccountForm";

const ConfigOptions = () => {
  const [providers, setProviders] = useState<MailProvider[]>();
  const [reload, setReload] = useState(false);
  const [reloadAccounts, setReloadAccounts] = useState(false);
  const [accounts, setAccounts] = useState<MailAccount[]>();
  const [selectedProvider, setSelectedProvider] = useState<MailProvider>();
  const [selectedAccount, setSelectedAccount] = useState<MailAccount>();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [openCreateProvider, setOpenCreateProvider] = useState(false);
  const [openAccountForm, setOpenAccountForm] = useState(false);

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
      render: (value: number) => <FileSize size={value} binary={true}/>,
    },
    {
      title: 'Bandeja de entrada',
      dataIndex: 'space_assigned',
      render: (value: any, r: any) => (
        <>
          <FileSize size={r.space_used} binary={true}/> /{' '}
          {value === 0 ? 'Sin límite' : <FileSize size={value} binary={true}/>}
        </>
      ),
    },
    {
      title: '',
      render: (_id: any, account: any) => (
        <Button
          size={'small'}
          type={'primary'}
          ghost
          onClick={() => setSelectedAccount(account)}
          icon={<ChartPieIcon className={'button-icon'}/>}>
          Liberar espacio
        </Button>
      ),
    },
  ];

  return (
    <>
      <ContentHeader
        title={'Configuración de cuentas de correo'}
        onAdd={() => setOpenCreateProvider(true)}
        onRefresh={() => setReload(!reload)}/>
      <Space wrap>
        <Select style={{width: 260}} placeholder={'Elige un proveedor de correo'} onChange={onProviderSelected}>
          {providers?.map(p => (
            <Select.Option key={p.uuid} value={p.uuid}>
              {p.name} ({p.num_accounts} cuentas)
            </Select.Option>
          ))}
        </Select>
        <PrimaryButton disabled={!selectedProvider} icon={<TbPlus/>} onClick={() => setOpenAccountForm(true)}>
          Registrar nueva cuenta
        </PrimaryButton>
        <Button
          type={'primary'}
          loading={syncing}
          icon={<span className={'icon-sync button-icon'}/>}
          disabled={!selectedProvider}
          ghost
          onClick={syncProvider}>
          Sincronizar
        </Button>
        <Button
          type={'primary'}
          loading={loading}
          icon={<span className={'icon-redo2 button-icon'}/>}
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
              {selectedProvider.type === 'smtp' && <SiMaildotru className={'icon smtp'}/>}
              {selectedProvider.type === 'cpanel' && <SiCpanel className={'icon cpanel'}/>}
              {selectedProvider.type === 'gmail' && <SiGmail className={'icon gmail'}/>}
            </div>
            <div>
              <h3 className={'title'}>{selectedProvider.name}</h3>({selectedProvider.username}) -{' '}
              {selectedProvider.host} | {selectedProvider.num_accounts} Accounts
            </div>
          </div>
          <TableList customStyle={false} pagination={false} rowKey={'uuid'} dataSource={accounts} columns={columns}/>
        </>
      )}
      {!selectedProvider && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Seleccionar un proveedor para ver las cuentas'}/>
      )}
      <ModalView
        title={'Registrar proveedor de correo'}
        onCancel={() => setOpenCreateProvider(false)}
        open={openCreateProvider}>
        <CreateProvider
          onFinish={() => {
            setReload(!reload);
            setOpenCreateProvider(false);
          }}
        />
      </ModalView>
      <ModalView
        title={'Registrar cuenta de correo'}
        onCancel={() => setOpenAccountForm(false)}
        open={openAccountForm}>
        {selectedProvider &&
          <MailAccountForm
            mailProvider={selectedProvider}
            onComplete={() => {
              setReload(!reload);
              setOpenAccountForm(false);
            }}
          />
        }
      </ModalView>
      <Drawer
        destroyOnHidden
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

export default ConfigOptions;
