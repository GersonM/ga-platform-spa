import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ListMailMessages from '../../Components/ListMailMessages';
import {MailFolderPageContent} from '../../../Types/api';

const MailMessagesViewer = () => {
  const params = useParams();
  const [folderContent, setFolderContent] = useState<MailFolderPageContent>();

  useEffect(() => {
    if (params.uuid) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`inbox-management/folders/${params.uuid}/messages`, config)
        .then(response => {
          if (response) {
            setFolderContent(response.data);
          }
        })
        .catch(e => {
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [params.uuid]);

  return (
    <div>
      <p>Folder: {params.uuid}</p>
      {folderContent && <ListMailMessages messages={folderContent} />}
    </div>
  );
};

export default MailMessagesViewer;
