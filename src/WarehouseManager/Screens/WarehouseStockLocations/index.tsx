import React, {useState} from 'react';
import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import StockLocationsMap from "../../Components/StockLocationsMap";
import FilterForm from "../../../CommonUI/FilterForm";
import {Form, Input} from "antd";
import WarehouseSelector from "../../Components/WarehouseSelector";
import type {StorageWarehouse} from "../../../Types/api.tsx";

const WarehouseStockLocations = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<StorageWarehouse>();

  return (
    <ModuleContent>
      <ContentHeader title="Ubicaciones en el mapa"/>
      <FilterForm>
        <Form.Item name={'warehouse_uuid'} label={'Ubicaciones'}>
          <WarehouseSelector onChange={(_uuid:string, w) => {
            setSelectedWarehouse(w?.entity);
            console.log(w);
          }} />
        </Form.Item>
      </FilterForm>
      <StockLocationsMap warehouse={selectedWarehouse} />
    </ModuleContent>
  );
};

export default WarehouseStockLocations;
