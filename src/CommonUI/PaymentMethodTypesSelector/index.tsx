import React from 'react';
import {Select} from "antd";

const PaymentMethodTypesSelector = () => {
  return (
    <Select
      showSearch
      options={[
      {label: 'Transferencia Bancaria', value:'bank_transfer'},
      {label: 'Efectivo', value:'cash'},
      {label: 'Tarjeta crédito/débido', value:'credit_card'},
      {label: 'Yape', value:'yape'},
      {label: 'Plin', value:'plin'},
      {label: 'Otro', value:'other'},
    ]} />
  );
};

export default PaymentMethodTypesSelector;
