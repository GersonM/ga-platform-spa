import React, {useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {
  CircleStackIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {Alert, Button, Empty} from 'antd';
import axios from 'axios';

import NavList, {NavListItem} from '../../../CommonUI/NavList';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import MailAccountSelector from '../../Components/MailAccountSelector';
import {MailAccount} from '../../../Types/api';
import MailSetupForm from '../../Components/MailSetupForm';

const InboxManager = () => {
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MailAccount>();

  const syncFolders = () => {
    if (selectedAccount) {
      axios.post(`inbox-management/accounts/${selectedAccount.uuid}/sync-folders`).then(() => {
        setReload(!reload);
      });
    }
  };

  const getIcon = (path: string) => {
    path = path.toLowerCase();
    switch (true) {
      case path.includes('drafts'):
        return <PencilSquareIcon />;
      case path.includes('spam'):
        return <ExclamationTriangleIcon />;
      case path.includes('junk'):
        return <TrashIcon />;
      case path.includes('trash'):
        return <TrashIcon />;
      case path.includes('sent'):
        return <PaperAirplaneIcon />;
      case path.includes('archive'):
        return <PaperClipIcon />;
      case path.includes('inbox'):
        return <InboxIcon />;
    }

    return <InboxIcon />;
  };

  return (
    <>
      <ModuleSidebar width={220}>
        <MailAccountSelector
          refresh={reload}
          onSelect={selected => {
            setSelectedAccount(selected);
            if (selected.folders?.length) {
              navigate(`/inbox-management/${selected.folders[0].uuid}`);
            }
          }}
        />

        {selectedAccount?.folders && (
          <>
            {!selectedAccount.setup_completed && (
              <div style={{padding: 15}}>
                <Alert message={'Ingresa la contraseña para activar esta cuenta'} type={'warning'} showIcon />
                <MailSetupForm mailAccount={selectedAccount} />
              </div>
            )}
            {selectedAccount.setup_completed && selectedAccount.folders.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay carpetas creadas esta cuenta'}>
                <Button type={'primary'} ghost icon={<ArrowPathIcon className={'button-icon'} />} onClick={syncFolders}>
                  Sincronizar carpetas
                </Button>
              </Empty>
            )}
            <NavList>
              {selectedAccount.folders.map(c => {
                const icon = getIcon(c.path);
                return (
                  <NavListItem
                    key={c.uuid}
                    height={45}
                    icon={icon}
                    name={c.name}
                    path={'/inbox-management/' + c.uuid}
                  />
                );
              })}
              <NavListItem
                key={'storage'}
                icon={<CircleStackIcon />}
                height={45}
                name={'Almacenamiento'}
                path={'/inbox-management/storage/' + selectedAccount.uuid}
              />
            </NavList>
          </>
        )}
      </ModuleSidebar>
      <ModuleContent opaque>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default InboxManager;
