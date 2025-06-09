
import {Tag, Tooltip} from 'antd';

import type {Contract} from '../../../Types/api';
import MoneyString from '../../../CommonUI/MoneyString';

interface ContractFinancialBriefProps {
  contract: Contract;
}

const ContractFinancialBrief = ({contract}: ContractFinancialBriefProps) => {
  return (
    <>
      <div className={'contract-invoice'}>
        {contract.provided_at && <Tag color={'blue'}>Entregado</Tag>} {contract.amount_string}{' '}
      </div>
      {contract.invoices?.map((i, index) => {
        return (
          <div key={index} className={'contract-invoice'}>
            <Tooltip
              title={
                <>
                  Total <MoneyString value={i.amount} />
                  <br />
                  {i.pending_payment && (
                    <>
                      Pendiente por pagar: <MoneyString value={i.pending_payment} />
                    </>
                  )}
                </>
              }>
              <Tag color={i.paid_at ? 'green' : 'red'}>{i.concept}</Tag>
            </Tooltip>
          </div>
        );
      })}
    </>
  );
};

export default ContractFinancialBrief;
