import React from 'react';
import {Col, Row, Tabs} from "antd";
import CsfFirewall from "../CsfFirewall";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {LuBrickWall, LuInfo} from "react-icons/lu";
import ResourceInformation from "../ResourceInformation";

interface FirewallManagerProps {
  resourceUuid?: string;
}

const FirewallManager = ({resourceUuid}:FirewallManagerProps) => {
  return (
    <div>
      <Tabs
        tabPosition={'left'}
        destroyOnHidden
        items={[
          {
            key: 'actions',
            label: 'Opciones',
            icon:<LuInfo size={18} style={{verticalAlign: 'bottom'}} />,
            children: <><h1>Acciones</h1></>
          },
          {
            key: 'conf',
            icon:<LuBrickWall size={18} style={{verticalAlign: 'bottom'}} />,
            label: 'Configuración',
            children: <CsfFirewall resourceUuid={resourceUuid}/>,
          },
          {
            key: 'ports',
            label: 'Puertos',
          },
          {
            key: 'ip-tables',
            label: 'Tabla de IP\'s',
          }
        ]}/>
    </div>
  );
};

export default FirewallManager;
