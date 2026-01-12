import {useEffect, useState} from 'react';
import {ChevronDownIcon} from '@heroicons/react/24/outline';
import axios from 'axios';
import {Dropdown, Empty} from 'antd';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {MailAccount} from '../../../Types/api';
import './styles.less';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {PlusIcon} from '@heroicons/react/24/solid';

interface MailAccountSelectorProps {
  onSelect?: (account: MailAccount, index: number) => void;
  selectedIndex?: number;
  refresh?: boolean;
}

const MailAccountSelector = ({onSelect, refresh, selectedIndex}: MailAccountSelectorProps) => {
  const [accounts, setAccounts] = useState<MailAccount[]>();
  const [selectedAccount, setSelectedAccount] = useState<MailAccount>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    axios
      .get(`inbox-management/accounts`, config)
      .then(response => {
        setAccounts(response.data);
        if (selectedAccount) {
          setSelectedAccount(response.data.find((a: MailAccount) => a.uuid === selectedAccount.uuid));
        } else {
          if (selectedIndex !== undefined) {
            setSelectedAccount(response.data[selectedIndex]);
            onSelect && onSelect(response.data[selectedIndex], selectedIndex);
          } else {
            if (response.data[0]) {
              setSelectedAccount(response.data[0]);
              onSelect && onSelect(response.data[0], 0);
            }
          }
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [refresh]);

  const onItemSelected = (key: string) => {
    const index = accounts?.findIndex(a => a.uuid === key);
    if (accounts && index) {
      setSelectedAccount(accounts[index]);
      if(onSelect) onSelect(accounts[index], index);
    }
  };

  return (
    <div className={'mail-account-selector-wrapper'}>
      {accounts && accounts.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No tienes cuentas asignadas'}>
          <PrimaryButton icon={<PlusIcon />} label={'Agregar'} />
        </Empty>
      )}
      {accounts && accounts.length > 0 && (
        <Dropdown
          menu={{
            items: accounts?.map((a: MailAccount) => {
              return {
                key: a.uuid,
                label: a.address,
              };
            }),
            activeKey: selectedAccount?.uuid,
            onClick: event => onItemSelected(event.key),
          }}>
          <div className={'selector'}>
            <div>
              <span className={'name'}>{selectedAccount?.contact_name}</span>
              <span className={'address'}>{selectedAccount?.address}</span>
            </div>
            <ChevronDownIcon width={20} />
          </div>
        </Dropdown>
      )}
    </div>
  );
};

export default MailAccountSelector;
