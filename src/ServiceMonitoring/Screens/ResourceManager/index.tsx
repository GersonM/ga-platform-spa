import React, {useEffect, useState} from 'react';
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {Tabs} from "antd";
import axios from "axios";
import type {ExternalResource} from "../../../Types/api.tsx";
import CsfFirewall from "../../Components/CsfFirewall";
import ExternalResourceForm from "../../Components/ExternalResourceForm";
import {LuFireExtinguisher} from "react-icons/lu";

const ResourceManager = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState<ExternalResource>();
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!params.uuid) return;

    const cancelTokenSource = axios.CancelToken.source();
    const config = {cancelToken: cancelTokenSource.token};

    setLoading(true);

    axios
      .get(`external-resources/${params.uuid}`, config)
      .then(response => {
        if (response) {
          setResource(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, params.uuid]);

  return (
    <ModuleContent>
      <ContentHeader
        title={resource?.type + ' | ' + resource?.name}
        onRefresh={() => setReload(!reload)}
        showBack
        description={resource?.description}/>
      <Tabs
        type={'card'}
        activeKey={params.tab}
        onChange={(v) => {
          navigate(`/resources/${params.uuid}/${v}`);
        }}
        destroyOnHidden
        items={[
        {
          key: 'info',
          label: 'Información',
          children: <ExternalResourceForm externalResource={resource} />
        },
        {
          key: 'firewall',
          icon:<LuFireExtinguisher />,
          label: 'Firewall',
          children: <CsfFirewall resourceUuid={params.uuid}/>
        },
        {
          key: 'databases',
          label: 'Bases de datos',
        },
        {
          key: 'stats',
          label: 'Estadisticas',
        }
      ]}/>
    </ModuleContent>
  );
};

export default ResourceManager;
