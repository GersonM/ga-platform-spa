import {useEffect, useState} from 'react';
import type {Contract, ContractItem} from '../../../Types/api';
import {Statistic, Tag} from 'antd';

interface ContractDetailsProps {
  contract: Contract;
}

const ContractDetails = ({contract}: ContractDetailsProps) => {
  const [_groups, setGroups] = useState<any>();

  useEffect(() => {
    // @ts-ignore
    setGroups(Object.groupBy(contract.items, ({group}: ContractItem) => group));
  }, [contract]);

  return (
    <div>
      <Statistic
        valueStyle={{fontSize: 15}}
        title={'Dirección'}
        value={`
            ${contract.items?.find(i => i.description == 'Manzana')?.value} -
            ${contract.items?.find(i => i.description == 'Lote')?.value}
            Etapa ${contract.items?.find(i => i.description == 'Etapa')?.value}
          `}
      />

      {contract?.items?.map((item: ContractItem, iIndex: number) => {
        return (
          <Tag key={iIndex}>
            <strong>{item.description}:</strong> <br />
            {item.value}
          </Tag>
        );
      })}
    </div>
  );
};

export default ContractDetails;
