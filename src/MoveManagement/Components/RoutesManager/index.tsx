import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Popconfirm} from 'antd';
import {TrashIcon} from '@heroicons/react/24/solid';

import ErrorHandler from '../../../Utils/ErrorHandler';
import TableList from '../../../CommonUI/TableList';
import {MoveLocation} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';
import RouteForm from '../RouteForm';

const RoutesManager = () => {
  const [routes, setRoutes] = useState<MoveLocation[]>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/locations`, config)
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

  const deleteLocation = (uuid: string) => {
    axios
      .delete(`move/locations/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const columns = [
    {title: 'Nombre', dataIndex: 'name'},
    {title: 'Dirección', dataIndex: 'address'},
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <>
          <Popconfirm title={'Eliminar lugar'} onConfirm={() => deleteLocation(uuid)}>
            <IconButton danger icon={<TrashIcon />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Lugares</h2>
      <TableList columns={columns} dataSource={routes} />
      <RouteForm onCompleted={() => setReload(!reload)} />
    </div>
  );
};

export default RoutesManager;
