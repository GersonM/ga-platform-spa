import React from 'react';
import {PencilIcon} from '@heroicons/react/24/solid';
import './styles.less';

interface InfoButtonProps {
  icon: React.ReactElement;
  label: string;
  caption?: string | React.ReactElement;
  onEdit?: () => void;
}

const InfoButton = ({icon, label, onEdit, caption}: InfoButtonProps) => {
  return (
    <div className={'info-button'} onClick={onEdit}>
      {icon}
      <div>
        {label}
        {caption && <span className={'caption'}>{caption}</span>}
      </div>
      {onEdit && <PencilIcon width={16} className={'icon-edit'} />}
    </div>
  );
};

export default InfoButton;
