import React from 'react';
import {Select} from "antd";

const PaymentMethodTypesSelector = ({...props}) => {
  return (
    <Select
      {...props}
      showSearch
      popupMatchSelectWidth={false}
      options={[
      {label: 'Débito automático', value:'automatic_debit'},
      {label: 'Transferencia Bancaria', value:'bank_transfer'},
      {label: 'Efectivo', value:'cash'},
      {label: 'Tarjeta crédito/débido', value:'credit_card'},
      {label: 'Yape', value:'yape'},
      {label: 'Plin', value:'plin'},
      {label: 'Cheque de gerencia', value:'cashier_check'},
      {label: 'Otro', value:'other'},
    ]} />
  );
};

export default PaymentMethodTypesSelector;
