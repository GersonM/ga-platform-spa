import React from 'react';
import {Select} from "antd";

const currencies = [
  {label: 'S/', value: 'PEN'},
  {label: 'USD $', value: 'USD'},
];

const CurrencySelector = ({...props}) => {
  return (
    <Select
      popupMatchSelectWidth={false}
      options={currencies}
      {...props}
    />
  );
};

export default CurrencySelector;
