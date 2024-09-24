import React from 'react';
import {TbPencil} from 'react-icons/tb';
import './styles.less';
import {Tooltip} from 'antd';

interface InfoButtonProps {
  icon: React.ReactElement;
  label: string | React.ReactElement;
  tooltip?: string;
  caption?: string | React.ReactElement;
  onEdit?: () => void;
}

const InfoButton = ({icon, label, onEdit, caption, tooltip}: InfoButtonProps) => {
  return (
    <Tooltip title={tooltip}>
      <div className={`info-button ${onEdit ? 'button' : ''}`} onClick={onEdit}>
        {icon}
        <div className={'button-content'}>
          {label}
          {caption && <span className={'info-button-caption'}>{caption}</span>}
        </div>
        <div className="icon-wrapper">{onEdit && <TbPencil />}</div>
      </div>
    </Tooltip>
  );
};

export default InfoButton;
