import React, {useEffect, useState} from 'react';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Token} from '../../../Types/api';
import TableList from '../../../CommonUI/TableList';
import dayjs from 'dayjs';
import IconButton from '../../../CommonUI/IconButton';
import {TrashIcon} from '@heroicons/react/16/solid';

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
      .get(`/authentication/users/${profileUuid}/tokens`, config)
      .then(response => {
        if (response) {
          setTokens(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

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
      <h2>Dispositivos autorizados</h2>
      <p>Estos son los dispositivos donde este usuario a iniciado sesión</p>
      <TableList columns={columns} dataSource={tokens} />
    </div>
  );
};

export default UserSessionsManager;
