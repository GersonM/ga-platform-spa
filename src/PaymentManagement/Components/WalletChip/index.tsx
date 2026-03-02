import React from 'react';
import type {Wallet} from "../../../Types/api.tsx";

interface WalletChipProps {
  wallet?: Wallet;
}

const bankName: any = {
  internal: 'Interno',
  bcp: 'BCP',
  bn_peru: 'Banco de la nación',
  interbank: 'Interbank',
  paypal: 'PayPal',
  bbva: 'BBVA',
  scotiabank: 'Scotiabank',
  caja_chica: 'Caja chica',
}

const WalletChip = ({wallet}: WalletChipProps) => {
  if(!wallet) {
    return null;
  }
  return (
    <span>{bankName[wallet.bank_name]}: <code>{wallet.account_number}</code>
      <small>{wallet.description}</small>
    </span>
  );
};

export default WalletChip;
