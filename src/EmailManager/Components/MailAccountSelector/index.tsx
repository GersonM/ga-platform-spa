import React, {useEffect, useState} from 'react';
import {ChevronDownIcon} from '@heroicons/react/24/outline';
import axios from 'axios';
import {Dropdown} from 'antd';

import ErrorHandler from '../../../Utils/ErrorHandler';
import './styles.less';
import {MailAccount} from '../../../Types/api';

interface MailAccountSelectorProps {
  onSelect?: (account: MailAccount) => void;
}

const MailAccountSelector = ({onSelect}: MailAccountSelectorProps) => {
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
        if (response) {
          setAccounts(response.data);
          if (response.data[0]) {
            setSelectedAccount(response.data[0]);
          }
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  useEffect(() => {
    if (onSelect && selectedAccount) {
      onSelect(selectedAccount);
    }
  }, [selectedAccount]);

  const onItemSelected = (item: any) => {
    setSelectedAccount(accounts?.find(a => a.uuid === item.key));
  };

  return (
    <div className={'mail-account-selector-wrapper'}>
      <Dropdown
        menu={{
          items: accounts?.map((a: MailAccount) => {
            return {
              key: a.uuid,
              label: a.address,
            };
          }),
          activeKey: selectedAccount?.uuid,
          onClick: onItemSelected,
        }}>
        <div className={'selector'}>
          {selectedAccount && (
            <div>
              <span className={'name'}>{selectedAccount.contact_name}</span>
              <span className={'address'}>{selectedAccount.address}</span>
            </div>
          )}
          <ChevronDownIcon width={20} />
        </div>
      </Dropdown>
    </div>
  );
};

export default MailAccountSelector;
