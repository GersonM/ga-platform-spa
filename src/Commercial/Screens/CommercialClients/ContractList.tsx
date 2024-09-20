import React from 'react';
import {Contract} from '../../../Types/api';
import ContractFinancialBrief from '../../Components/ContractFinancialBrief';

interface ContractListProps {
  contracts?: Contract[];
}

const ContractList = ({contracts}: ContractListProps) => {
  return (
    <div className={'contract-list-wrapper'}>
      {contracts?.map((c: Contract, cIndex: number) => {
        return (
          <div className={'contract-item'} key={cIndex}>
            <ContractFinancialBrief contract={c} />
          </div>
        );
      })}
    </div>
  );
};

export default ContractList;
