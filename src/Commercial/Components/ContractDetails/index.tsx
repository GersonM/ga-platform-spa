import {useEffect, useState} from 'react';
import type {Contract, ContractItem} from '../../../Types/api';
import {Statistic, Tag} from 'antd';
import StockSelector from "../../../WarehouseManager/Components/StockSelector";
import axios from "axios";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ProfileChip from "../../../CommonUI/ProfileTools/ProfileChip.tsx";
import StockViewerState from "../StockViewerState";

interface ContractDetailsProps {
  contract: Contract;
  onChange?: () => void;
}

const ContractDetails = ({contract, onChange}: ContractDetailsProps) => {
  const [groups, setGroups] = useState<any>();
  const [changeStockUuid, setChangeStockUuid] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);


  useEffect(() => {
    // @ts-ignore
    setGroups(Object.groupBy(contract.items, ({group}: ContractItem) => group));
  }, [contract]);

  const updateStock = () => {
    setLoading(true);
    axios
      .post(`commercial/contracts/${contract?.uuid}/update-stock`, {stock_uuid: changeStockUuid})
      .then(() => {
        setLoading(false);
        setReload(!reload);
        if(onChange) onChange();
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
      {contract?.created_by && (
        <>
          <h3>Vendedor:</h3>
          <div>
            <ProfileChip profile={contract?.created_by}/>
          </div>
        </>
      )}
      {contract?.contractable && <StockViewerState stock={contract.contractable}/>}
      <p>
        <strong>Observaciones: </strong> <br/>
        {contract?.observations}
      </p>
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
