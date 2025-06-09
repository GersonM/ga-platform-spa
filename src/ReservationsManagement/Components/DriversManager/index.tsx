import {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/24/solid';
import {Col, Popconfirm, Row} from 'antd';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import TableList from '../../../CommonUI/TableList';
import type {MoveDriver} from '../../../Types/api';
import IconButton from '../../../CommonUI/IconButton';
import DriverForm from '../DriverForm';

const DriversManager = () => {
  const [drivers, setDrivers] = useState<MoveDriver[]>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/drivers`, config)
      .then(response => {
        if (response) {
          setDrivers(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const deleteLocation = (uuid: string) => {
    axios
      .delete(`move/drivers/${uuid}`)
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      render: (_uuid: string, driver: MoveDriver) => {
        return `${driver.profile?.name} ${driver.profile?.last_name}`;
      },
    },
    {
      title: 'Licencia',
      dataIndex: 'license_type',
      render: (_uuid: string, driver: MoveDriver) => {
        return `${driver.license_type} ${driver.license_number}`;
      },
    },
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
    <>
      <Row gutter={20}>
        <Col span={12}>
          <TableList columns={columns} dataSource={drivers} />
        </Col>
        <Col span={12}>
          <DriverForm onCompleted={() => setReload(!reload)} />
        </Col>
      </Row>
    </>
  );
};

export default DriversManager;
