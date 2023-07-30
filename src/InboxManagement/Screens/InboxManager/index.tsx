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
} from '@heroicons/react/24/outline';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import MailAccountSelector from '../../Components/MailAccountSelector';
import {MailAccount} from '../../../Types/api';
import {Empty} from 'antd';

const InboxManager = () => {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<MailAccount>();

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
          onSelect={selected => {
            setSelectedAccount(selected);
            if (selected.folders?.length) {
              navigate(`/inbox-management/${selected.folders[0].uuid}`);
            }
          }}
        />

        {selectedAccount?.folders && (
          <>
            {selectedAccount.folders.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Esta cuenta aún no está configurada'} />
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
      <ModuleContent>
        <Outlet />
      </ModuleContent>
    </>
  );
};

export default InboxManager;
