import React from 'react';
import {PiFile} from 'react-icons/pi';

interface IconItemProps {
  size?: number;
  name: string;
  caption?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  image?: string;
  onClick?: (selected: boolean) => void;
  onDoubleClick?: () => void;
}

const IconItem = ({name, caption, icon, image, selected = false, onClick, onDoubleClick}: IconItemProps) => {
  const onItemClick = () => {
    if (onClick) {
      onClick(!selected);
    }
  };

  return (
    <div
      title={name}
      className={`file-item ${selected ? 'selected' : ''}`}
      onDoubleClick={onDoubleClick}
      onClick={onItemClick}>
      <div className={'file-image'} style={image ? {backgroundColor: '#ffffff', backgroundImage: `url(${image})`} : {}}>
        {!image ? icon ? icon : <PiFile color={'#444444'} size={20} /> : null}
      </div>
      <div className={'file-item-info'}>
        <span className={'file-name'}>{name}</span>
        {caption && <span className={'file-caption'}>{caption}</span>}
      </div>
    </div>
  );
};

export default IconItem;
