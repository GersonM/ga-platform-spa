import {useEffect, useMemo, useState} from 'react';
import {Alert, Button, Col, Popover, Progress, Row} from 'antd';
import dayjs from 'dayjs';
import MailSetupForm from '../MailSetupForm';
import {PencilIcon} from '@heroicons/react/24/outline';
import axios from 'axios';

import type {MailAccount, MailAccountStats} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import './styles.less';

type BackupResult = {
  saved?: number;
  bytes?: number;
  nextToken?: string | null;
  elapsed?: number;
};

interface MailBackupManagerProps {
  mailAccount: MailAccount;
  onChange?: () => void;
}

const MailBackupManager = ({mailAccount, onChange}: MailBackupManagerProps) => {
  const [percentUsage, setPercentUsage] = useState(0);
  const [stats, setStats] = useState<MailAccountStats[]>();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(0);

  useMemo(() => {
    const assigned = mailAccount.space_assigned || mailAccount.space_used * 5;
    const percent = assigned ? (mailAccount.space_used / assigned) * 100 : 0;
    setPercentUsage(Math.round(percent));
  }, [mailAccount.space_used, mailAccount.space_assigned]);

  useEffect(() => {
    if (mailAccount.setup_completed) {
      setLoading(true);
      const cancelTokenSource = axios.CancelToken.source();
      const config = {cancelToken: cancelTokenSource.token};

      axios
        .get(`inbox-management/accounts/${mailAccount.uuid}/stats`, config)
        .then(response => {
          setLoading(false);
          if (response) setStats(response.data);
        })
        .catch(e => {
          setLoading(false);
          ErrorHandler.showNotification(e);
        });

      return cancelTokenSource.cancel;
    }
  }, [mailAccount.setup_completed, mailAccount.uuid]);

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

  const runGmailBackup = async () => {
    try {
      setLoading(true);
      setSaved(0);
      const after = dayjs().subtract(30, 'day').format('YYYY/MM/DD');
      const before = dayjs().format('YYYY/MM/DD');

      let nextToken: string | null = null;

      do {
        const resp = await axios.post<BackupResult | {data: BackupResult}>(
          `inbox-management/accounts/${mailAccount.uuid}/gmail/backup`,
          {
            after,
            before,
            labelIds: ['INBOX'],
            pageSize: 50,
            maxPages: 3,
            maxSeconds: 45,
            pageToken: nextToken,
          }
        );

        const body = resp.data as any;
        const res: BackupResult = (body.data ?? body) as BackupResult;
        setSaved(s => s + (res?.saved ?? 0));
        nextToken = res.nextToken ?? null;
      } while (nextToken);

      onChange && onChange();
    } catch (e) {
      ErrorHandler.showNotification(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col>
          <h3>
            {mailAccount.contact_name || mailAccount.address} <br />
            <small>{mailAccount.address}</small>
          </h3>
          <small>{mailAccount.uuid}</small>
        </Col>
        <Col>
          <Popover
            title="Editar cuenta"
            trigger={['click']}
            content={<MailSetupForm onChange={onChange} mailAccount={mailAccount} />}
          >
            <Button type="text" shape="circle">
              <PencilIcon className="button-icon" />
            </Button>
          </Popover>
        </Col>
      </Row>

      <div style={{ marginTop: 12 }}>
        <div>Espacio en bandeja</div>
        <Progress percent={percentUsage} status={percentUsage > 90 ? 'exception' : 'normal'} />
        <Button
          type="primary"
          onClick={runGmailBackup}
          block
          style={{ marginTop: 8 }}
          disabled={loading || !mailAccount.setup_completed}
        >
          Ejecutar backup
        </Button>
      </div>

      {!mailAccount.setup_completed && (
        <>
          <Alert
            style={{ marginTop: 16 }}
            message="La cuenta no está configurada"
            description="Ingresa la contraseña para poder realizar acciones con esta dirección de correo"
            type="warning"
            showIcon
          />
          <MailSetupForm onChange={onChange} mailAccount={mailAccount} />
        </>
      )}

      <LoadingIndicator visible={loading} overlay={false} size="small" />

      {stats &&
        stats.map((s, index) => (
          <div key={index} className="stats-wrapper">
            <div className="header">
              {s.folder.name} ({s.total_messages} mensajes)
            </div>
            {s.total_messages > 0 && (
              <ul>
                {Object.keys(s.messages_stats).map((k, i) => (
                  <li key={i}>
                    {k === 'oldest' ? 'Mas antiguos' : k} ({s.messages_stats[k]} mensajes)
                    <Button
                      type="primary"
                      size="small"
                      ghost
                      onClick={() => freeSpace(s.folder_path, k)}
                      disabled={s.messages_stats[k] === 0}
                      style={{ marginLeft: 8 }}
                    >
                      Respaldar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </>
  );
};

export default MailBackupManager;
