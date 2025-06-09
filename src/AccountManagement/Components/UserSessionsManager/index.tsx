import {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/16/solid';
import {IoReload} from 'react-icons/io5';
import dayjs from 'dayjs';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import type {Token} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import IconButton from '../../../CommonUI/IconButton';
import {Space} from 'antd';

interface IUserSessionsManager {
  profileUuid: string;
}

const UserSessionsManager = ({profileUuid}: IUserSessionsManager) => {
  const [tokens, setTokens] = useState<Token[]>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`/authentication/profiles/${profileUuid}/tokens`, config)
      .then(response => {
        if (response) {
          setTokens(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, profileUuid]);

  const deleteToken = (id: number) => {
    axios
      .delete(`/authentication/tokens/${id}`, {})
      .then(() => {
        setReload(!reload);
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });
  };

  const columns = [
    {dataIndex: 'id', title: 'ID'},
    {dataIndex: 'name', title: 'Dispositivo'},
    {dataIndex: 'last_used_at', title: 'Último uso', render: (date: string) => dayjs(date).fromNow()},
    {dataIndex: 'created_at', title: 'Creado', render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm a')},
    {
      dataIndex: 'id',
      title: 'Acciones',
      render: (id: number) => {
        return <IconButton icon={<TrashIcon />} danger onClick={() => deleteToken(id)} />;
      },
    },
  ];

  return (
    <div>
      <Space>
        <h2>Dispositivos autorizados</h2>
        <IconButton icon={<IoReload size={18} />} onClick={() => setReload(!reload)} />
      </Space>
      <p>Estos son los dispositivos donde este usuario a iniciado sesión</p>
      <TableList rowKey={'id'} columns={columns} dataSource={tokens} />
    </div>
  );
};

export default UserSessionsManager;
