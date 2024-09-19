import React from 'react';
import {TbPencil} from 'react-icons/tb';
import './styles.less';

interface InfoButtonProps {
  icon: React.ReactElement;
  label: string | React.ReactElement;
  caption?: string | React.ReactElement;
  onEdit?: () => void;
}

const InfoButton = ({icon, label, onEdit, caption}: InfoButtonProps) => {
  return (
    <div className={`info-button ${onEdit ? 'button' : ''}`} onClick={onEdit}>
      {icon}
      <div className={'button-content'}>
        {label}
        {caption && <span className={'info-button-caption'}>{caption}</span>}
      </div>
      <div className="icon-wrapper">{onEdit && <TbPencil />}</div>
    </div>
  );
};

export default InfoButton;
