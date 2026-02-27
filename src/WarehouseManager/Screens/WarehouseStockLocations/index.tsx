import React, {useState} from 'react';
import {Form, Select} from "antd";

import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import StockLocationsMap from "../../Components/StockLocationsMap";
import FilterForm from "../../../CommonUI/FilterForm";
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
        <Form.Item label="Estado" name={'status'}>
          <Select
            allowClear
            placeholder={'Disponible'}
            popupMatchSelectWidth={false}
            options={[
            {label: 'Disponible', value: 'available'},
            {label: 'No disponibles', value: 'not_available'},
            {label: 'Vendidos', value: 'sold'},
            {label: 'Reservados', value: 'reserved'},
            {label: 'Dañados', value: 'damaged'},
            {label: 'Todos', value: 'all'},
          ]}/>
        </Form.Item>
      </FilterForm>
      <StockLocationsMap warehouse={selectedWarehouse} />
    </ModuleContent>
  );
};

export default WarehouseStockLocations;
