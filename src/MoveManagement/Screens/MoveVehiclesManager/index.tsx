import React, {useEffect, useState} from 'react';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import {Modal, Popconfirm, Space, Tooltip} from 'antd';
import LocationsManager from '../../Components/LocationsManager';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {ListBulletIcon, MapPinIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/solid';
import TableList from '../../../CommonUI/TableList';
import RouteForm from '../../Components/RouteForm';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {MoveRoute, MoveVehicle} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';
import VehicleForm from '../../Components/VehicleForm';

const MoveVehiclesManager = () => {
  const [openLocationModal, setOpenLocationModal] = useState(false);
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
    {title: 'Conductor', dataIndex: 'fk_driver_uuid'},
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
          <Tooltip title={'Editar lugares'}>
            <IconButton onClick={() => setSelectedVehicle(route)} icon={<ListBulletIcon />} />
          </Tooltip>
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
        <PrimaryButton icon={<MapPinIcon />} label={'Lugares'} onClick={() => setOpenLocationModal(true)} />
      </Space>
      <TableList columns={routesColumns} dataSource={vehicles} />
      <Modal footer={false} open={openLocationModal} destroyOnClose onCancel={() => setOpenLocationModal(false)}>
        <LocationsManager />
      </Modal>
      <Modal
        title={'Nueva ruta'}
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
