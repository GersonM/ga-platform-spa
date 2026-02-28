import React, {useEffect, useState} from 'react';
import {Form, Input, Select} from "antd";

import ModuleContent from "../../../CommonUI/ModuleContent";
import ContentHeader from "../../../CommonUI/ModuleContent/ContentHeader.tsx";
import StockLocationsMap from "../../Components/StockLocationsMap";
import FilterForm from "../../../CommonUI/FilterForm";
import WarehouseSelector from "../../Components/WarehouseSelector";
import type {StorageWarehouse} from "../../../Types/api.tsx";
import useGetWarehouse from "../../Hooks/useGetWarehouse.tsx";

const WarehouseStockLocations = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<StorageWarehouse>();
  const [filters, setFilters] = useState<any>()
  const {getWarehouse} = useGetWarehouse();

  return (
    <ModuleContent>
      <ContentHeader title="Ubicaciones en el mapa"/>
      <FilterForm
        onSubmit={(values) => setFilters(values)}
        onInitialValues={(values) => {
          if (values.warehouse_uuid) {
            getWarehouse(values.warehouse_uuid)
              .then(warehouse => setSelectedWarehouse(warehouse));
          }
          setFilters(values);
        }}
      >
        <Form.Item label={'Buscar'} name={'search'}>
          <Input placeholder={'Buscar'} allowClear/>
        </Form.Item>
        <Form.Item name={'warehouse_uuid'} label={'Ubicaciones'}>
          <WarehouseSelector onChange={(_uuid: string, w) => {
            setSelectedWarehouse(w?.entity);
          }}/>
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
      <StockLocationsMap warehouse={selectedWarehouse} {...filters} />
    </ModuleContent>
  );
};

export default WarehouseStockLocations;
