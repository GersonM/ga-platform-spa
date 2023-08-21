import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Button, Segmented} from 'antd';
import {ArrowPathIcon} from '@heroicons/react/24/outline';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ListMailMessages from '../../Components/ListMailMessages';
import {MailFolderPageContent} from '../../../Types/api';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';

const MailMessagesViewer = () => {
  const params = useParams();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folderContent, setFolderContent] = useState<MailFolderPageContent>();

  useEffect(() => {
    if (params.uuid) {
      setLoading(true);
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`inbox-management/folders/${params.uuid}/messages`, config)
        .then(response => {
          setLoading(false);
          if (response) {
            setFolderContent(response.data);
          }
        })
        .catch(e => {
          setLoading(false);
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [params.uuid, reload]);

  return (
    <div style={{position: 'relative'}}>
      <Button
        type={'text'}
        onClick={() => setReload(!reload)}
        shape={'round'}
        icon={<ArrowPathIcon className={'button-icon'} />}
      />
      <Segmented options={['Ambos', 'Respaldados', 'Sin respaldo']} onResize={undefined} onResizeCapture={undefined} />
      <LoadingIndicator visible={loading} message={'Cargando'} />
      {folderContent && <ListMailMessages messages={folderContent} />}
    </div>
  );
};

export default MailMessagesViewer;
