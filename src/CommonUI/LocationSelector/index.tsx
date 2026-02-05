import React, {useState} from 'react';
import {Button, Input, Space} from "antd";
import {TbMapPin} from "react-icons/tb";
import ModalView from "../ModalView";

interface LocationSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  value?: string | string[];
  disabled?: boolean;
  style?: any;
  size?: 'small' | 'large';
}

const LocationSelector = ({onChange, value}: LocationSelectorProps) => {
  const [openMap, setOpenMap] = useState(false);
  const [location, setLocation] = useState<any>(value);
  return <><Space.Compact>
    <Button icon={<TbMapPin/>} onClick={() => setOpenMap(true)}/>
    <Input
      value={value}
      placeholder={'Valor'}
      onChange={(e: any) => {
        onChange?.('value', e.target.value);
        setLocation(e.target.value);
      }}
    />
  </Space.Compact>
    <ModalView title={'asdf'} open={openMap} onCancel={() => setOpenMap(false)}>
      Hola: {location}
    </ModalView>
  </>;
};

export default LocationSelector;
