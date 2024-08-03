import React, {useEffect, useState} from 'react';
import {Modal, Popconfirm, Space} from 'antd';
import {PencilIcon, TrashIcon, UserIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import IconButton from '../../../CommonUI/IconButton';
import VehicleForm from '../../Components/VehicleForm';
import DriversManager from '../../Components/DriversManager';
import {MoveDriver, MoveRoute, MoveVehicle} from '../../../Types/api';

const MoveVehiclesManager = () => {
  const [openDriverModal, setOpenDriverModal] = useState(false);
  const [openVehicleForm, setOpenVehicleForm] = useState(false);
  const [vehicles, setVehicles] = useState<MoveVehicle[]>();
  const [reload, setReload] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MoveVehicle>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/vehicles`, config)
      .then(response => {
        if (response) {
          setVehicles(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteRoute = (uuid: string) => {
    axios
      .delete(`move/routes/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const routesColumns = [
    {title: 'Placa', dataIndex: 'registration_plate'},
    {title: 'Fabricante', dataIndex: 'brand'},
    {title: 'Modelo', dataIndex: 'model'},
    {title: 'Color', dataIndex: 'color'},
    {title: 'Tipo', dataIndex: 'type'},
    {title: 'Capacidad', dataIndex: 'max_capacity'},
    {
      title: 'Conductor',
      dataIndex: 'driver',
      render: (driver: MoveDriver) => {
        return `${driver.profile?.name} ${driver.profile?.last_name}`;
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string, route: MoveRoute) => (
        <Space>
          <IconButton
            onClick={() => {
              setSelectedVehicle(route);
              setOpenVehicleForm(true);
            }}
            icon={<PencilIcon />}
          />
          <Popconfirm title={'Eliminar ruta'} onConfirm={() => deleteRoute(uuid)}>
            <IconButton danger icon={<TrashIcon />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ContentHeader title={'Unidades'} onAdd={() => setOpenVehicleForm(true)} onRefresh={() => setReload(!reload)} />
      <Space>
        <PrimaryButton icon={<UserIcon />} label={'Conductores'} onClick={() => setOpenDriverModal(true)} />
      </Space>
      <TableList columns={routesColumns} dataSource={vehicles} />
      <Modal
        width={900}
        footer={false}
        open={openDriverModal}
        destroyOnClose
        onCancel={() => setOpenDriverModal(false)}>
        <DriversManager />
      </Modal>
      <Modal
        title={'Nuevo vehiculo'}
        footer={false}
        open={openVehicleForm}
        destroyOnClose
        onCancel={() => {
          setOpenVehicleForm(false);
          setSelectedVehicle(undefined);
        }}>
        <VehicleForm
          vehicle={selectedVehicle}
          onCompleted={() => {
            setSelectedVehicle(undefined);
            setOpenVehicleForm(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </>
  );
};

export default MoveVehiclesManager;
