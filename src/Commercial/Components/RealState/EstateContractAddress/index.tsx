import {HomeModernIcon} from '@heroicons/react/24/outline';
import InfoButton from '../../../../CommonUI/InfoButton';
import type {Contract} from '../../../../Types/api';

interface EstateContractAddressProps {
  contract?: Contract;
  tooltip?: string;
  onEdit?: () => void;
}

const EstateContractAddress = ({contract, onEdit, tooltip}: EstateContractAddressProps) => {
  return (
    <InfoButton
      tooltip={tooltip}
      icon={<HomeModernIcon width={20} className={'icon'} />}
      caption={'Dirección'}
      onEdit={onEdit}
      label={`${contract?.contractable?.sku}`}
    />
  );
};

export default EstateContractAddress;
