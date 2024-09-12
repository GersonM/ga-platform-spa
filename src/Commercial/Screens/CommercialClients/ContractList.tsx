import React from 'react';
import {Contract} from '../../../Types/api';
import {Popover} from 'antd';
import ContractDetails from '../../Components/ContractDetails';
import ContractFinancialBrief from '../../Components/ContractFinancialBrief';
import IconButton from '../../../CommonUI/IconButton';
import {PiEyeBold} from 'react-icons/pi';
import {useNavigate} from 'react-router-dom';

interface ContractListProps {
  contracts?: Contract[];
}

const ContractList = ({contracts}: ContractListProps) => {
  const navigate = useNavigate();

  return (
    <div className={'contract-list-wrapper'}>
      {contracts?.map((c: Contract, cIndex: number) => {
        return (
          <Popover key={cIndex} placement={'left'} content={<ContractDetails contract={c} />}>
            <div className={'contract-item'}>
              <IconButton
                onClick={() => {
                  navigate(`/commercial/contracts/${c.uuid}`);
                }}
                type={'link'}
                icon={<PiEyeBold />}
                small
              />
              <ContractFinancialBrief contract={c} />
            </div>
          </Popover>
        );
      })}
    </div>
  );
};

export default ContractList;
