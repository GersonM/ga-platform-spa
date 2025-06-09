import {useEffect, useMemo, useState} from 'react';
import {Alert, Button, Col, Popover, Progress, Row} from 'antd';
import MailSetupForm from '../MailSetupForm';
import {PencilIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import {MailAccount, MailAccountStats} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import './styles.less';

interface MailBackupManagerProps {
  mailAccount: MailAccount;
  onChange?: () => void;
}

const MailBackupManager = ({mailAccount, onChange}: MailBackupManagerProps) => {
  const [percentUsage, setPercentUsage] = useState(0);
  const [stats, setStats] = useState<MailAccountStats[]>();
  const [loading, setLoading] = useState(false);

  useMemo(() => {
    const assigned = mailAccount.space_assigned || mailAccount.space_used * 5;
    const percent = (mailAccount.space_used / assigned) * 100;
    console.log(percent);
    setPercentUsage(Math.round(percent));
  }, [mailAccount.space_used]);

  useEffect(() => {
    if (mailAccount.setup_completed) {
      setLoading(true);
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
      };

      axios
        .get(`inbox-management/accounts/${mailAccount.uuid}/stats`, config)
        .then(response => {
          setLoading(false);
          if (response) {
            setStats(response.data);
          }
        })
        .catch(e => {
          setLoading(false);
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, []);

  const freeSpace = (folderPath: string, time: string) => {
    setLoading(true);
    axios
      .post(`inbox-management/accounts/${mailAccount.uuid}/backup-messages`, {folder_path: folderPath, time})
      .then(() => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <>
      <Row justify={'space-between'}>
        <Col>
          <h3>
            {mailAccount.contact_name || mailAccount.address} <br />
            <small>{mailAccount.address}</small>
          </h3>
          <small>{mailAccount.uuid}</small>
        </Col>
        <Col>
          <Popover
            title={'Editar cuenta'}
            trigger={['click']}
            content={<MailSetupForm onChange={onChange} mailAccount={mailAccount} />}>
            <Button type={'text'} shape={'circle'}>
              <PencilIcon className={'button-icon'} />
            </Button>
          </Popover>
        </Col>
      </Row>
      <br />
      Espacio en bandeja
      <Progress percent={percentUsage} status={percentUsage > 90 ? 'exception' : 'normal'} />
      {!mailAccount.setup_completed && (
        <>
          <Alert
            style={{marginBottom: 20}}
            message={'La cuenta no está configurada'}
            description={'Ingresa la contraseña para poder realizar acciones con esta dirección de correo'}
            type={'warning'}
            showIcon
          />
          <MailSetupForm onChange={onChange} mailAccount={mailAccount} />
        </>
      )}
      <LoadingIndicator visible={loading} overlay={false} size={'small'} />
      {stats &&
        stats.map((s, index) => (
          <div key={index} className={'stats-wrapper'}>
            <div className={'header'}>
              {s.folder.name} ({s.total_messages} mensajes)
            </div>
            {s.total_messages > 0 && (
              <ul>
                {Object.keys(s.messages_stats).map((k, index) => {
                  return (
                    <li key={index}>
                      {k === 'oldest' ? 'Mas antiguos' : k} ({s.messages_stats[k]} mensajes)
                      <Button
                        type={'primary'}
                        size={'small'}
                        ghost
                        onClick={() => freeSpace(s.folder_path, k)}
                        disabled={s.messages_stats[k] === 0}>
                        Respaldar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
    </>
  );
};

export default MailBackupManager;
