import React, {useMemo} from 'react';
import {LiaEnvelope, LiaGlobeAmericasSolid, LiaWhatsapp} from "react-icons/lia";
import {Tooltip} from "antd";

interface ChannelIconProps {
  channel:string;
}

const ChannelIcon = ({channel}:ChannelIconProps) => {
  const icon = useMemo(() => {
    switch (true) {
      case channel.includes('Whatsapp'):
        return <LiaWhatsapp />;
      case channel.includes('Email'):
        return <LiaEnvelope />;
      case channel.includes('Web'):
        return <LiaGlobeAmericasSolid />;
    }
  }, [channel]);

  return <Tooltip title={channel}>{icon}</Tooltip>;
};

export default ChannelIcon;
