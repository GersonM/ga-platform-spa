import React from 'react';

interface IconItemProps {
  size?: 'large' | 'small';
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
      {image ? (
        <div className={'file-image'} style={{backgroundImage: `url(${image})`}}></div>
      ) : icon ? (
        icon
      ) : (
        <span className="icon icon-file-empty"></span>
      )}
      <span className={'file-name'}>{name.length > MAX_CHARS ? name.substring(0, MAX_CHARS) + '...' : name}</span>
      {caption && <span className={'file-caption'}>{caption}</span>}
    </div>
  );
};

export default IconItem;
