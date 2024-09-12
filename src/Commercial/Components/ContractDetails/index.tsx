import React from 'react';
import {Contract} from '../../../Types/api';
import NavList, {NavListItem} from '../../../CommonUI/NavList';

interface ContractDetailsProps {
  contract: Contract;
}

const ContractDetails = ({contract}: ContractDetailsProps) => {
  return (
    <div>
      <NavList>
        {contract.items?.map((item: any, iIndex: number) => {
          return <NavListItem key={iIndex} path={false} name={item.value} caption={item.description} />;
        })}
      </NavList>
    </div>
  );
};

export default ContractDetails;
