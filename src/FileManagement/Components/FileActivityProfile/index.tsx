import {useEffect, useState} from 'react';
import type {FileActivity} from '../../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import dayjs from 'dayjs';
import {Empty, List} from 'antd';

interface FileActivityProfileProps {
  profileUuid: string;
}

const FileActivityProfile = ({profileUuid}: FileActivityProfileProps) => {
  const [fileActivity, setFileActivity] = useState<FileActivity[]>();
  const [_loading, setLoading] = useState(false);
  const [reload, _setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {profile_uuid: profileUuid},
    };
    setLoading(true);
    axios
      .get('file-management/activities/', config)
      .then(response => {
        setLoading(false);
        if (response) {
          setFileActivity(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, profileUuid]);

  return (
    <div>
      {!fileActivity?.length && (
        <Empty description={'No hay actividad registrada'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <List>
        {fileActivity?.map(a => (
          <List.Item key={a.uuid}>
              {a.file?.name} <br />
              <small className={'message'}>{a.action} {dayjs(a.created_at).format('DD/MM/YYYY [a las] hh:mm a')}</small>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default FileActivityProfile;
