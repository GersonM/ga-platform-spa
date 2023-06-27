import React, {useState} from 'react';
import {Cog6ToothIcon, CogIcon, PlusCircleIcon} from '@heroicons/react/24/outline';
import {NavLink, Outlet, useNavigate, useParams} from 'react-router-dom';
import {Button, Popover, Tabs, TabsProps, Tooltip} from 'antd';

import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import CreateContainer from '../../../FileManagement/Components/CreateContainer';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import ContainerNavItem from '../../../FileManagement/Screens/CompanyContainers/ContainerNavItem';
import ModuleContent from '../../../CommonUI/ModuleContent';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import MailAccountInformation from '../../Components/MailAccountInformation';

const ListEmailAccounts = () => {
  const [emailAccounts, setEmailAccounts] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCreateAccount, setOpenCreateAccount] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const onChange = (key: string) => {
    console.log(key);
    navigate(`/mail-management/accounts/${params.uuid}/${key}`);
  };

  const items: TabsProps['items'] = [
    {
      key: 'information',
      label: 'Información',
      children: <MailAccountInformation />,
    },
    {
      key: 'messages',
      label: `Mensajes almacenados`,
    },
  ];

  return (
    <>
      <ModuleSidebar
        title={'Cuentas de correo'}
        actions={
          <>
            <Tooltip title={'Configurar correo'}>
              <Button type={'text'} shape={'circle'}>
                <Cog6ToothIcon height={24} />
              </Button>
            </Tooltip>
            <Popover
              open={openCreateAccount}
              content={
                <CreateContainer
                  onCompleted={() => {
                    setReload(!reload);
                    setOpenCreateAccount(false);
                  }}
                />
              }
              onOpenChange={value => {
                setOpenCreateAccount(value);
              }}
              trigger={'click'}>
              <Tooltip title={'Crear contenedor'}>
                <Button type={'text'} shape={'circle'}>
                  <PlusCircleIcon height={24} />
                </Button>
              </Tooltip>
            </Popover>
          </>
        }>
        <NavList>
          <NavListItem
            name={'Gerson Aduviri'}
            caption={'gerson@geekadvice.pe'}
            path={'/mail-management/accounts/asdfasf-adfasdf'}
          />
          <NavListItem name={'daniela@geekadvice.pe'} path={'/mail-management/accounts/2'} />
          <NavListItem name={'soporte@geekadvice.pe'} path={'/mail-management/accounts/3'} />
          <NavListItem name={'asdfasdf'} path={'/mail-management/accounts/4'} />
          <NavListItem name={'asdfasdf'} path={'/mail-management/accounts/5'} />
        </NavList>
        <ul className="list-items">
          <LoadingIndicator visible={loading} />
          {emailAccounts?.length === 0 && (
            <EmptyMessage message={'No tienes contenedores creados, haz clic en el + para crear uno'} />
          )}
          {emailAccounts && (
            <>
              {emailAccounts.map(c => (
                <li key={c.uuid}>
                  <ContainerNavItem container={c} onChange={() => setReload(!reload)} />
                </li>
              ))}
              <li>
                <NavLink to={`/file-management/containers/trash`}>
                  <span className="icon icon-trash3"></span>
                  <span className="label">Elementos borrados</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </ModuleSidebar>
      <ModuleContent>
        <Tabs style={{marginTop: -15}} activeKey={params.tab || 'information'} items={items} onChange={onChange} />
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default ListEmailAccounts;
