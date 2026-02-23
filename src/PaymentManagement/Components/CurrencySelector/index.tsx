import React, {useContext} from 'react';
import {Select} from "antd";
import AuthContext from "../../../Context/AuthContext.tsx";

const currencyLabels: any = {
  PEN: 'PEN S/',
  USD: 'USD $',
  EUR: 'EUR €',
  AED: 'Dirham',
}

const CurrencySelector = ({...props}) => {
  const {config} = useContext(AuthContext);
  return (
    <Select
      placeholder={'Elige moneda'}
      allowClear
      defaultActiveFirstOption={true}
      popupMatchSelectWidth={false}
      options={config?.currency?.map((currency: string) =>
        ({label: currencyLabels[currency], value: currency})
      )}
      {...props}
    />
  );
};

export default CurrencySelector;
