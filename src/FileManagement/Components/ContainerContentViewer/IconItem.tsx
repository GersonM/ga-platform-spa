import React from 'react';

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

const MAX_CHARS = 33;

const IconItem = ({name, caption, icon, image, selected = false, onClick, onDoubleClick}: IconItemProps) => {
  const onItemClick = () => {
    if (onClick) {
      onClick(!selected);
    }
  };

  return (
    <div className={`file-item ${selected ? 'selected' : ''}`} onDoubleClick={onDoubleClick} onClick={onItemClick}>
      <div className={'file-image'} style={image ? {backgroundImage: `url(${image})`} : {}}>
        {!image ? icon ? icon : <span className="icon icon-file-empty"></span> : null}
      </div>
      <div className={'file-item-info'}>
        <span className={'file-name'}>{name.length > MAX_CHARS ? name.substring(0, MAX_CHARS) + '...' : name}</span>
        {caption && <span className={'file-caption'}>{caption}</span>}
      </div>
    </div>
  );
};

export default IconItem;
