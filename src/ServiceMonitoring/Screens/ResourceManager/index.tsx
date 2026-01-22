import React, {useEffect, useState} from 'react';
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {Tabs} from "antd";
import axios from "axios";
import type {ExternalResource} from "../../../Types/api.tsx";
import CsfFirewall from "../../Components/CsfFirewall";
import ExternalResourceForm from "../../Components/ExternalResourceForm";
import {LuBrickWall, LuFireExtinguisher, LuInfo} from "react-icons/lu";
import ResourceInformation from "../../Components/ResourceInformation";
import CustomTag from "../../../CommonUI/CustomTag";
import FirewallManager from "../../Components/FirewallManager";

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
    <ModuleContent boxed>
      <ContentHeader
        title={resource?.name}
        tools={<CustomTag>{resource?.type}</CustomTag>}
        onRefresh={() => setReload(!reload)}
        onBack={() => navigate("/resources")}
        description={resource?.description}/>
      <Tabs
        activeKey={params.tab}
        onChange={(v) => {
          navigate(`/resources/${params.uuid}/${v}`);
        }}
        destroyOnHidden
        items={[
        {
          key: 'info',
          label: 'Información',
          icon:<LuInfo size={18} style={{verticalAlign: 'bottom'}} />,
          children: <ResourceInformation resourceUuid={params.uuid} />
        },
        {
          key: 'firewall',
          icon:<LuBrickWall size={18} style={{verticalAlign: 'bottom'}} />,
          label: 'Firewall',
          children: <FirewallManager resourceUuid={params.uuid}/>,
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
