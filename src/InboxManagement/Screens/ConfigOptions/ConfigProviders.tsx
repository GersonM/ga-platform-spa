import React, {useEffect, useState} from 'react';
import {Badge, Button, Card, Empty, Form, Input, Popover, Select, Space, Tag} from 'antd';
import {SiCpanel, SiGmail} from 'react-icons/si';
import axios from 'axios';

import {MailAccount, MailProvider} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateProvider from './CreateProvider';
import FileSize from '../../../CommonUI/FileSize';

const ConfigProviders = () => {
  const [providers, setProviders] = useState<MailProvider[]>();
  const [reload, setReload] = useState(false);
  const [accounts, setAccounts] = useState<MailAccount[]>();
  const [selectedProvider, setSelectedProvider] = useState<MailProvider>();

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
          }
        })
        .catch(e => {
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [selectedProvider]);

  const syncProvider = () => {
    if (!selectedProvider) {
      return;
    }
    axios
      .post(`inbox-management/providers/${selectedProvider?.uuid}/sync`)
      .then(response => {
        if (response) {
          setReload(!reload);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const onProviderSelected = (item: string) => {
    setSelectedProvider(providers?.find(p => p.uuid === item));
  };

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
      </Space>
      {selectedProvider && (
        <div className={'item-mail-provider'}>
          <div className="logo">
            {selectedProvider.type === 'cpanel' && <SiCpanel className={'icon cpanel'} />}
            {selectedProvider.type === 'gmail' && <SiGmail className={'icon gmail'} />}
          </div>
          <div>
            <h3 className={'title'}>{selectedProvider.name}</h3>({selectedProvider.username}) - {selectedProvider.host}{' '}
            | {selectedProvider.num_accounts} Accounts
          </div>
        </div>
      )}
      {accounts &&
        accounts.map(p => {
          const percent = p.space_assigned === 0 ? 0 : (p.space_used / p.space_assigned) * 100;
          return (
            <div key={p.uuid} className={'item-mail-provider'}>
              <Tag color={percent > 80 ? 'orange' : 'blue'}>
                <FileSize size={p.space_used} /> de <FileSize size={p.space_assigned} />
              </Tag>
              {p.contact_name} :: {p.address}
            </div>
          );
        })}
      {accounts && accounts.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay cuentas registradas en este proveedor'} />
      )}
    </>
  );
};

export default ConfigProviders;
