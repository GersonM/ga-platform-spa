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
import {MoveRoute} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';

const MoveRoutesManager = () => {
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [openRouteManager, setOpenRouteManager] = useState(false);
  const [routes, setRoutes] = useState<MoveRoute[]>();
  const [reload, setReload] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<MoveRoute>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/routes`, config)
      .then(response => {
        if (response) {
          setRoutes(response.data);
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
    {title: 'Nombre', dataIndex: 'name'},
    {title: 'Lugares', dataIndex: 'locations'},
    {title: 'Distancia', dataIndex: 'distance'},
    {title: 'Duración', dataIndex: 'duration'},
    {title: 'Costo', dataIndex: 'cost'},
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string, route: MoveRoute) => (
        <Space>
          <IconButton
            onClick={() => {
              setSelectedRoute(route);
              setOpenRouteManager(true);
            }}
            icon={<PencilIcon />}
          />
          <Tooltip title={'Editar lugares'}>
            <IconButton onClick={() => setSelectedRoute(route)} icon={<ListBulletIcon />} />
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
      <ContentHeader title={'Rutas'} onAdd={() => setOpenRouteManager(true)} onRefresh={() => setReload(!reload)} />
      <Space>
        <PrimaryButton icon={<MapPinIcon />} label={'Lugares'} onClick={() => setOpenLocationModal(true)} />
      </Space>
      <TableList columns={routesColumns} dataSource={routes} />
      <Modal footer={false} open={openLocationModal} destroyOnClose onCancel={() => setOpenLocationModal(false)}>
        <LocationsManager />
      </Modal>
      <Modal
        title={'Nueva ruta'}
        footer={false}
        open={openRouteManager}
        destroyOnClose
        onCancel={() => {
          setOpenRouteManager(false);
          setSelectedRoute(undefined);
        }}>
        <RouteForm
          route={selectedRoute}
          onCompleted={() => {
            setSelectedRoute(undefined);
            setOpenRouteManager(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </>
  );
};

export default MoveRoutesManager;
