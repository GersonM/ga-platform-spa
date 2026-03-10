import React from "react";
import {TbPencil} from 'react-icons/tb';
import {Tooltip} from 'antd';
import './styles.less';

interface InfoButtonProps {
  icon?: React.ReactElement;
  label?: string | React.ReactElement;
  tooltip?: string;
  large?: boolean;
  value?: string | React.ReactElement | number;
  onEdit?: () => void;
}

const InfoButton = ({icon, label, onEdit, value, tooltip, large}: InfoButtonProps) => {
  const content = <div className={`info-button ${onEdit ? 'button' : ''} ${large ? 'large' : ''}`} onClick={onEdit}>
    {icon &&
      <div className={'label-icon-wrapper'}>
        {icon}
      </div>
    }
    <div className={'button-content'}>
      {label && <span className={'label'}>{label}</span>}
      {value && <span className={'value'}>{value}</span>}
    </div>
    <div className="icon-wrapper">{onEdit && <TbPencil/>}</div>
  </div>;

  return (tooltip ?
      <Tooltip title={tooltip}>
        {content}
      </Tooltip> : content
  );
};

export default InfoButton;
