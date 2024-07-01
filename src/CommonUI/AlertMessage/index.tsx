import React, {useState} from 'react';
import {CheckIcon, XMarkIcon} from '@heroicons/react/24/solid';
import {ExclamationTriangleIcon} from '@heroicons/react/24/solid';

import IconButton from '../IconButton';
import './styles.less';

interface IAlertMessageProps {
  message: string;
  caption?: string;
  type?: 'success' | 'warning' | 'error';
  float?: boolean;
  dismissible?: boolean;
}

const AlertMessage = ({message, caption, type = 'warning', float, dismissible}: IAlertMessageProps) => {
  const [dismiss, setDismiss] = useState(false);

  if (dismiss) return null;

  return (
    <div className={`alert-message-wrapper ${type} ${float ? 'float' : ''}`}>
      <div className={'icon'}>
        {type === 'success' ? <CheckIcon width={25} /> : <ExclamationTriangleIcon width={25} />}
      </div>
      <div>
        {message}
        {caption && <div className={'caption'}>{caption}</div>}
      </div>
      {dismissible && <IconButton icon={<XMarkIcon color={'#000000'} />} onClick={() => setDismiss(true)} />}
    </div>
  );
};

export default AlertMessage;
