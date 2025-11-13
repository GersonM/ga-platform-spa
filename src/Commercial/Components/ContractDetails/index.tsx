import type {Contract} from '../../../Types/api';
import {Divider} from 'antd';

import StockViewerState from "../StockViewerState";
import CommercialContractForm from "../CommercialContractForm";
import StorageStockChip from "../StorageStockChip";

interface ContractDetailsProps {
  contract: Contract;
  onChange?: () => void;
}

const ContractDetails = ({contract, onChange}: ContractDetailsProps) => {

  return (
    <div>
      <CommercialContractForm contract={contract} onComplete={onChange}/>
      <Divider>Detalle de productos</Divider>
      {contract.cart?.map((cart, index) => (
        <StorageStockChip key={index} storageStock={cart.stock}/>
      ))}
      {/*
        contract?.contractable && <StockViewerState stock={contract.contractable}/>
      */}
    </div>
  );
};

export default ContractDetails;
