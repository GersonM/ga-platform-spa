import React from 'react';
import {Tag} from 'antd';

import {Contract} from '../../../Types/api';

interface ContractFinancialBriefProps {
  contract: Contract;
}

const ContractFinancialBrief = ({contract}: ContractFinancialBriefProps) => {
  return (
    <>
      <div className={'contract-invoice'}>
        {contract.provided_at && <Tag>Entregado</Tag>} {contract.amount_string}{' '}
      </div>
      {contract.invoices?.map((i, index) => {
        return (
          <div key={index} className={'contract-invoice'}>
            {i.concept}:{' '}
            <Tag
              color={i.paid_at ? 'green' : 'red'}
              title={'Pendiente por pagar' + (i.pending_payment ? i.pending_payment / 100 : 'No pagos')}>
              S/ {(i.amount / 100).toFixed(2)}
            </Tag>
          </div>
        );
      })}
    </>
  );
};

export default ContractFinancialBrief;
