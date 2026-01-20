import {useState} from 'react';
import {XMarkIcon} from '@heroicons/react/24/solid';
import {InformationCircleIcon} from '@heroicons/react/24/solid';
import {PiCheck, PiExclamationMark, PiWarningDiamond} from 'react-icons/pi';

import IconButton from '../IconButton';
import './styles.less';

interface IAlertMessageProps {
  message: string;
  caption?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  float?: boolean;
  dismissible?: boolean;
  children?: React.ReactNode;
}

const AlertMessage = ({children, message, caption, type = 'warning', float, dismissible}: IAlertMessageProps) => {
  const [dismiss, setDismiss] = useState(false);

  if (dismiss) return null;

  return (
    <div className={`alert-message-wrapper ${type} ${float ? 'float' : ''}`}>
      <div className={'icon'}>
        {type === 'success' && <PiCheck size={20} />}
        {type === 'warning' && <PiExclamationMark size={20} />}
        {type === 'info' && <InformationCircleIcon width={25} />}
        {type === 'error' && <PiWarningDiamond size={25} />}
      </div>
      <div className={'content'}>
        {message}
        {caption && <div className={'caption'}>{caption}</div>}
        {children && <div className={'caption'}>{children}</div>}
      </div>
      {dismissible && <IconButton icon={<XMarkIcon color={'#000000'} />} onClick={() => setDismiss(true)} />}
    </div>
  );
};

export default AlertMessage;
