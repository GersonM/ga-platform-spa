import React from 'react';
import {HomeModernIcon} from '@heroicons/react/24/outline';
import InfoButton from '../../../../CommonUI/InfoButton';
import {Contract} from '../../../../Types/api';

interface EstateContractAddressProps {
  contract: Contract;
}

const EstateContractAddress = ({contract}: EstateContractAddressProps) => {
  return (
    <InfoButton
      icon={<HomeModernIcon width={20} className={'icon'} />}
      caption={'Dirección'}
      label={`
        ${contract.items?.find(i => i.description == 'Manzana')?.value} -
        ${contract.items?.find(i => i.description == 'Lote')?.value}
        Etapa ${contract.items?.find(i => i.description == 'Etapa')?.value}
      `}
    />
  );
};

export default EstateContractAddress;
