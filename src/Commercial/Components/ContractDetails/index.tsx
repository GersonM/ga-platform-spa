import type {Contract} from '../../../Types/api';
import CommercialContractForm from "../CommercialContractForm";

interface ContractDetailsProps {
  contract: Contract;
  onChange?: () => void;
}

const ContractDetails = ({contract, onChange}: ContractDetailsProps) => {

  return (
    <CommercialContractForm contract={contract} onComplete={onChange}/>
  );
};

export default ContractDetails;
