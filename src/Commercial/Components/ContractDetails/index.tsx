import {useEffect, useState} from 'react';
import type {Contract, ContractItem} from '../../../Types/api';
import {Descriptions, Divider, Statistic, Tag} from 'antd';
import axios from "axios";

import StockSelector from "../../../WarehouseManager/Components/StockSelector";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import StockViewerState from "../StockViewerState";
import CommercialContractForm from "../CommercialContractForm";

interface ContractDetailsProps {
  contract: Contract;
  onChange?: () => void;
}

const ContractDetails = ({contract, onChange}: ContractDetailsProps) => {
  const [changeStockUuid, setChangeStockUuid] = useState<string>();
  const [loading, setLoading] = useState(false);

  const updateStock = () => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/update-stock`, {stock_uuid: changeStockUuid})
      .then(() => {
        setLoading(false);
        if (onChange) onChange();
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div>
      <div style={{marginBottom: 15}}>
        <StockSelector onChange={value => setChangeStockUuid(value)} style={{width: '100%'}}/>
        {changeStockUuid && (
          <PrimaryButton style={{marginTop: 10}} block label={'Cambiar lote'} onClick={updateStock}/>
        )}
      </div>
      <CommercialContractForm contract={contract} onComplete={onChange} />
      <Divider />
      {contract?.contractable && <StockViewerState stock={contract.contractable}/>}
      <Divider>
        Items de contrato
      </Divider>
      {contract?.items &&
        <Descriptions items={
          contract?.items?.map((item: ContractItem) => {
            return {key: item.uuid, label: item.description, children: item.value};
          })}/>
      }
    </div>
  );
};

export default ContractDetails;
