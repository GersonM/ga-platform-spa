import {useEffect, useState} from 'react';
import axios from 'axios';
import {TrashIcon} from '@heroicons/react/24/solid';
import {Popconfirm} from 'antd';

import ErrorHandler from '../../../Utils/ErrorHandler';
import TableList from '../../../CommonUI/TableList';
import {MoveLocation} from '../../../Types/api';
import LocationForm from '../LocationForm';
import IconButton from '../../../CommonUI/IconButton';

const LocationsManager = () => {
  const [locations, setLocations] = useState<MoveLocation[]>();
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
          setLocations(response.data);
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
      <TableList columns={columns} dataSource={locations} />
      <LocationForm onCompleted={() => setReload(!reload)} />
    </div>
  );
};

export default LocationsManager;
