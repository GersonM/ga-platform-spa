import React from 'react';
import {Contract} from '../../../Types/api';

interface ContractDetailsProps {
  contract: Contract;
}

const ContractDetails = ({contract}: ContractDetailsProps) => {
  return (
    <div>
      <ul>
        {contract.items?.map((item: any, iIndex: number) => {
          return (
            <li key={iIndex}>
              <strong>{item.description}:</strong>
              {item.value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ContractDetails;
