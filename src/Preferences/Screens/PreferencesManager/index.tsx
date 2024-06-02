import React, {useContext, useEffect, useState} from 'react';
import {Divider} from 'antd';
import axios from 'axios';

import MetaTitle from '../../../CommonUI/MetaTitle';
import AuthContext from '../../../Context/AuthContext';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {SettingsGroup} from '../../../Types/api';
import PreferenceValue from '../../Components/PreferenceValue';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import './styles.less';

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
    <>
      <MetaTitle title={'Configuración de la cuenta'} />
      <ContentHeader loading={loading} title={'Configuración de la cuenta'} onRefresh={() => setReload(!reload)}>
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
    </>
  );
};

export default PreferencesManager;
