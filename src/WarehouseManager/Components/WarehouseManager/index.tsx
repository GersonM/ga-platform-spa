import React, {useEffect, useState} from 'react';
import {TbPencil, TbPlus, TbTrash} from "react-icons/tb";
import {Modal, Space} from "antd";
import axios from "axios";

import type {StorageStock, StorageWarehouse} from "../../../Types/api.tsx";
import TableList from "../../../CommonUI/TableList";
import IconButton from "../../../CommonUI/IconButton";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import {WarehouseForm} from "../WarehouseForm";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

const WarehouseManager = () => {
  const [productStock, setProductStock] = useState<StorageStock[]>();
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false);
  const [stockState, setStockState] = useState<string>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<StorageWarehouse>();
  const [openWarehouseForm, setOpenWarehouseForm] = useState(false)

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {status: stockState}
    };

    setLoading(true);

    axios
      .get('warehouses', config)
      .then(response => {
        if (response) {
          setProductStock(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, stockState]);

  const deleteWarehouse = (uuid: string) => {
    axios
      .request({
        url: `warehouses/${uuid}`,
        method: 'DELETE'
      })
      .then(() => {
        setReload(!reload);
      })
      .catch(err => {
        ErrorHandler.showNotification(err);
      });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 80,
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
    },
    {
      title: 'Dirección física',
      dataIndex: 'is_physical',
      render: (is_physical: boolean) => is_physical ? 'SI' : 'No'
    },
    {
      title: '',
      dataIndex: 'uuid',
      width: 70,
      render: (uuid: string, warehouse: StorageWarehouse) => {
        return <Space>
          <IconButton small icon={<TbPencil/>} onClick={() => {
            setSelectedWarehouse(warehouse);
            setOpenWarehouseForm(true);
          }}/>
          <IconButton small icon={<TbTrash/>} danger onClick={() => deleteWarehouse(uuid)}/>
        </Space>;
      }
    }
  ]

  return (
    <div>
      <h2>Almacenes</h2>
      <p>
        <PrimaryButton icon={<TbPlus/>} ghost label={'Crear nuevo almacen'} onClick={() => {
          setOpenWarehouseForm(true);
          setSelectedWarehouse(undefined);
        }}/>
      </p>
      <TableList loading={loading} columns={columns} dataSource={productStock}/>
      <Modal footer={null} open={openWarehouseForm} onCancel={() => {
        setOpenWarehouseForm(false);
        setSelectedWarehouse(undefined);
      }}>
        <WarehouseForm warehouse={selectedWarehouse} onComplete={() => {
          setOpenWarehouseForm(false);
          setSelectedWarehouse(undefined);
          setReload(!reload);
        }}/>
      </Modal>
    </div>
  );
};

export default WarehouseManager;
