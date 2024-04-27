import React, {useContext, useEffect, useState} from 'react';
import {CheckIcon} from '@heroicons/react/24/solid';

import ModuleContent from '../../../CommonUI/ModuleContent';
import TenantForm from './TenantForm';
import MetaTitle from '../../../CommonUI/MetaTitle';
import AuthContext from '../../../Context/AuthContext';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

import './styles.less';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {SettingsGroup} from '../../../Types/api';
import {Divider, Input} from 'antd';

const PreferencesManager = () => {
  const {config} = useContext(AuthContext);
  const [settings, setSettings] = useState<SettingsGroup[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`tenant-management/settings`, config)
      .then(response => {
        if (response) {
          setSettings(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  const saveChanges = () => {
    axios.put('tenant-management/settings').then(res => {
      console.log(res);
    });
  };

  return (
    <ModuleContent>
      <MetaTitle title={'Configuración de la cuenta'} />
      <h1>Configuración del Tenant</h1>
      Nombre de la cuenta: {config?.name}
      {settings?.map(value => {
        return (
          <div>
            <Divider>{value.key.replace('-', ' ')}</Divider>
            {value.settings.map(s => {
              return (
                <p>
                  {s.key}
                  <Input value={s.value} />
                </p>
              );
            })}
          </div>
        );
      })}
    </ModuleContent>
  );
};

export default PreferencesManager;
