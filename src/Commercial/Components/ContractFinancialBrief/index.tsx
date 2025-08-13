
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
        {contract.provided_at && <Tag color={'blue'}>Entregado</Tag>} <MoneyString currency={contract.currency} value={contract.amount} />
      </div>
      {contract.invoices?.map((i, index) => {
        return (
          <div key={index} className={'contract-invoice'}>
            <Tooltip
              title={
                <>
                  Total <MoneyString currency={i.currency} value={i.amount} />
                  <br />
                  {i.pending_payment && (
                    <>
                      Pendiente por pagar: <MoneyString currency={i.currency} value={i.pending_payment} />
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
