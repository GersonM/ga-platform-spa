import React from 'react';
import {Select} from "antd";

const CountrySelector = ({...props}) => {
  return (
    <Select
      {...props}
      showSearch
      optionFilterProp={'label'}
      placeholder={'Buscar país'}
      options={[
        {label: 'Perú', value: 'PE'},
        {label: 'Venezuela', value: 'VEN'},
        {label: 'Ecuador', value: 'ECU'},
        {label: 'Chile', value: 'CL'},
        {label: 'Colombia', value: 'CO'},
        {label: 'Brasil', value: 'BR'},
        {label: 'Estados Unidos', value: 'USA'},
        {label: 'Canadá', value: 'CAN'},
        {label: 'España', value: 'ESP'},
        {label: 'Otro', value: 'Other'},
      ]}
    />
  );
};

export default CountrySelector;
