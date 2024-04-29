import React, {useContext, useEffect, useState} from 'react';

import ModuleContent from '../../../CommonUI/ModuleContent';
import MetaTitle from '../../../CommonUI/MetaTitle';
import AuthContext from '../../../Context/AuthContext';

import './styles.less';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {SettingsGroup} from '../../../Types/api';
import {Divider, Input} from 'antd';
import PreferenceValue from '../../Components/PreferenceValue';

const PreferencesManager = () => {
  const {config} = useContext(AuthContext);
  const [settings, setSettings] = useState<SettingsGroup[]>();
  const [reload, setReload] = useState(false);

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
  }, [reload]);

  return (
    <ModuleContent>
      <MetaTitle title={'Configuración de la cuenta'} />
      <h1>Configuración del Tenant</h1>
      Nombre de la cuenta: {config?.name}
      {settings?.map(value => {
        return (
          <div>
            <Divider>{value.label}</Divider>
            {value.settings.map((s, sI) => (
              <PreferenceValue key={sI} preference={s} onUpdated={() => setReload(!reload)} />
            ))}
          </div>
        );
      })}
    </ModuleContent>
  );
};

export default PreferencesManager;
