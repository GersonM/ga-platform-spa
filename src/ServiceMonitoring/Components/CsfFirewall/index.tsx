import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Divider, Input, Space} from "antd";
import PreferenceValue from "../../../Preferences/Components/PreferenceValue";

interface CsfFirewallProps {
  resourceUuid: string;
}

const CsfFirewall = ({resourceUuid}:CsfFirewallProps) => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<any[]>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`external-resources/servers/${resourceUuid}/firewall-config`, config)
      .then(response => {
        if (response) {
          setResources(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);
  return (
    <div>
      {resources?.map((item, i) => (
        <div key={i}>
          <pre>{item.comment}</pre>
          <PreferenceValue preference={{
            key: item.key,
            type: 'string',
            label:item.key,
            value:item.value,
          }}/>
          <Divider/>
        </div>
      ))}
    </div>
  );
};

export default CsfFirewall;
