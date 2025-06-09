import {useEffect, useState} from 'react';
import {useOutletContext, useParams} from 'react-router-dom';
import axios from 'axios';
import {Segmented} from 'antd';
import ErrorHandler from '../../../Utils/ErrorHandler';
import ListMailMessages from '../../Components/ListMailMessages';
import type {MailFolder, MailFolderPageContent, MailMessage} from '../../../Types/api';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import MailMessageViewer from '../../Components/MailMessageViewer';

const MailMessagesViewer = () => {
  const params = useParams();
  const {folder} = useOutletContext<{folder: MailFolder}>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folderContent, setFolderContent] = useState<MailFolderPageContent>();
  const [content, setContent] = useState<MailMessage>();

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
    <>
      <ContentHeader
        title={content ? content.subject : folder?.name}
        description={content?.from[0].full}
        onBack={() => setContent(undefined)}
        onRefresh={() => setReload(!reload)}
        tools={<>{!content && <Segmented options={['Ambos', 'Respaldados', 'Sin respaldo']} />}</>}
      />
      <LoadingIndicator visible={loading} message={'Cargando'} />
      {content ? (
        <MailMessageViewer message={content} />
      ) : (
        folderContent && <ListMailMessages messages={folderContent} onMessageSelected={msg => setContent(msg)} />
      )}
    </>
  );
};

export default MailMessagesViewer;
