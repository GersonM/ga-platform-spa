import React, {useContext, useEffect, useState} from 'react';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import AuthContext from '../../../Context/AuthContext';
import {TenantConfig} from '../../../Types/api';
import axios from 'axios';
import {Tabs, TabsProps} from 'antd';

const WorkspaceManagement = () => {
  const {user} = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState<TenantConfig[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`workspaces`, config)
      .then(response => {
        if (response) {
          setWorkspaces(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  console.log(user?.tenants);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tab 1',
      children: 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: 'Tab 2',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Tab 3',
      children: 'Content of Tab Pane 3',
    },
  ];
  return (
    <div>
      <ContentHeader title={'Configuración de workspaces'} />
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default WorkspaceManagement;
