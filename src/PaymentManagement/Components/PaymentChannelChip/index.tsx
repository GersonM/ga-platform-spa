import React from 'react';

interface PaymentChannelChipProps {
  channel?: string;
}

const channels: any = {
  automatic_debit: 'Débito automático',
  bank_transfer: 'Transferencia Bancaria',
  cash: 'Efectivo',
  izipay: 'Izipay',
  credit_card: 'Tarjeta crédito/débido',
  yape: 'Yape',
  plin: 'Plin',
  cashier_check: 'Cheque de gerencia',
  other: 'Otro',
}

const PaymentChannelChip = ({channel}: PaymentChannelChipProps) => {
  return (
    channel && <span>{channels[channel]}</span>
  );
};

export default PaymentChannelChip;
