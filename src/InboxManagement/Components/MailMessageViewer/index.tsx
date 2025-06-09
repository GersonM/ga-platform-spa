import type {MailMessage} from '../../../Types/api';

interface MailMessageViewerProps {
  message: MailMessage;
}

const MailMessageViewer = ({message}: MailMessageViewerProps) => {
  /*useEffect(() => {
    if (params.uuid) {
      setLoading(true);
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`inbox-management/folders/${params.uuid}/messages/${messageId}`, config)
        .then(response => {
          setLoading(false);
          if (response) {
            setMessage(response.data);
          }
        })
        .catch(e => {
          setLoading(false);
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [params.uuid]);*/

  return (
    <div>
      {message.body ? (
        <div style={{borderRadius: 12, overflow: 'hidden'}} dangerouslySetInnerHTML={{__html: message.body}} />
      ) : (
        'Este mensaje no tiene contenido'
      )}
    </div>
  );
};

export default MailMessageViewer;
