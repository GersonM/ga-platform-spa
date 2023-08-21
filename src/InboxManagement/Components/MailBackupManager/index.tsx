import React, {useEffect, useMemo, useState} from 'react';
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
  }, []);

  const freeSpace = (folderPath: string, time: string) => {
    axios
      .post(`inbox-management/accounts/${mailAccount.uuid}/free-space`, {folder_path: folderPath, time})
      .then(() => {});
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
      <LoadingIndicator visible={loading} overlay={false} />
      {stats &&
        stats.map((s, index) => (
          <div key={index} className={'stats-wrapper'}>
            <div className={'header'}>
              {s.folder.name} ({s.total_messages} mensajes)
            </div>
            {s.total_messages > 0 && (
              <ul>
                <li>
                  2023 ({s.messages_stats['2023']} mensajes)
                  <Button
                    type={'primary'}
                    size={'small'}
                    onClick={() => freeSpace(s.folder_path, '2023')}
                    disabled={s.messages_stats['2023'] === 0}>
                    Respaldar
                  </Button>
                </li>
                <li>
                  2022 ({s.messages_stats['2022']})
                  <Button
                    type={'primary'}
                    size={'small'}
                    onClick={() => freeSpace(s.folder_path, '2022')}
                    disabled={s.messages_stats['2022'] === 0}>
                    Respaldar
                  </Button>
                </li>
                <li>
                  2021 ({s.messages_stats['2021']})
                  <Button
                    type={'primary'}
                    size={'small'}
                    onClick={() => freeSpace(s.folder_path, '2021')}
                    disabled={s.messages_stats['2021'] === 0}>
                    Respaldar
                  </Button>
                </li>
                <li>
                  Más antiguos ({s.messages_stats.oldest})
                  <Button
                    type={'primary'}
                    size={'small'}
                    onClick={() => freeSpace(s.folder_path, '2020+')}
                    disabled={s.messages_stats.oldest === 0}>
                    Respaldar
                  </Button>
                </li>
              </ul>
            )}
          </div>
        ))}
    </>
  );
};

export default MailBackupManager;
