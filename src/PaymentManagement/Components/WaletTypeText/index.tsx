import React from 'react';

interface WalletTypeTextProps {
  code: string;
}

const WalletTypeText = ({code}: WalletTypeTextProps) => {
  const codes: any = {
    'cashier': 'Cajero',
    'current_account': 'Cuenta corriente',
    'deductions_accounts': 'Cuenta de detracciones',
    'saving_accounts': 'Cuenta de ahorros',
    'credit_card': 'Tarjeta crédito',
    'debit_card': 'Tarjeta débito',
    'wallet': 'Billetera virtual',
  }
  return (codes[code]);
};

export default WalletTypeText;
