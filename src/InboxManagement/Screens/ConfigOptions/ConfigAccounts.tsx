import {useEffect, useState} from 'react';
import {Button, Card, Empty, Form, Input, Select} from 'antd';
import {SiCpanel, SiGmail} from 'react-icons/si';
import axios from 'axios';

import type {MailAccount, MailProvider} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {useForm} from 'antd/lib/form/Form';

const ConfigAccounts = () => {
  const [providers, setProviders] = useState<MailProvider[]>();
  const [_accounts, _setAccounts] = useState<MailAccount[]>();
  const [reload, setReload] = useState(false);
  const [form] = useForm();

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

  const syncProvider = (providerUuid: string) => {
    axios
      .post(`inbox-management/providers/${providerUuid}/sync`)
      .then(response => {
        if (response) {
          setReload(!reload);
        }
        form.resetFields();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const onSubmitForm = (values: any) => {
    axios
      .post(`inbox-management/providers`, values)
      .then(response => {
        if (response) {
          setReload(!reload);
        }
        form.resetFields();
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <>
      <h3>Proveedores registrados</h3>
      {providers &&
        providers.map(p => (
          <div key={p.uuid} className={'item-mail-provider'}>
            {p.type === 'cpanel' && <SiCpanel size={40} className={'icon cpanel'} />}
            {p.type === 'gmail' && <SiGmail size={20} className={'icon gmail'} />}
            <Button type={'link'} onClick={() => syncProvider(p.uuid)}>
              Sincronizar
            </Button>
            ({p.username}) - {p.host} | {p.num_accounts} Accounts
          </div>
        ))}
      {providers && providers.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay proveedores registrados'} />
      )}
      <Card title={'Nuevo proveedor'} size={'small'}>
        <Form form={form} layout={'inline'} onFinish={onSubmitForm}>
          <Form.Item name={'name'} label={'Nombre'}>
            <Input />
          </Form.Item>
          <Form.Item name={'host'} label={'Host'}>
            <Input />
          </Form.Item>
          <Form.Item name={'username'} label={'App / Usuario'}>
            <Input />
          </Form.Item>
          <Form.Item name={'key'} label={'Key / Password'}>
            <Input />
          </Form.Item>
          <Form.Item name={'api_endpoint'} label={'Endpoint'}>
            <Input />
          </Form.Item>
          <Form.Item name={'type'} label={'Tipo'}>
            <Select placeholder="Tipos de servidor">
              <Select.Option value="cpanel">Cpanel / Webmail</Select.Option>
              <Select.Option value="gmail">Gmail / Workspace</Select.Option>
              <Select.Option value="outlook">Outlook / Office 365</Select.Option>
            </Select>
          </Form.Item>
          <Button type={'primary'} htmlType={'submit'}>
            Registrar proveedor
          </Button>
        </Form>
      </Card>
    </>
  );
};

export default ConfigAccounts;
