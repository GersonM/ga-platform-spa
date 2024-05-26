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
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';

const PreferencesManager = () => {
  const {config} = useContext(AuthContext);
  const [settings, setSettings] = useState<SettingsGroup[]>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`tenant-management/settings`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setSettings(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  return (
    <ModuleContent>
      <MetaTitle title={'Configuración de la cuenta'} />
      <ContentHeader loading={loading} title={'Configuración del Tenant'} onRefresh={() => setReload(!reload)}>
        <p>Nombre de la cuenta: {config?.config.name}</p>
      </ContentHeader>
      {settings?.map((value, index) => {
        return (
          <div key={index}>
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
