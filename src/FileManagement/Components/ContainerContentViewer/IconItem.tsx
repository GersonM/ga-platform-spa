import React from 'react';
import FileDropdownActions from '../FileDropdownActions';

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

const IconItem = ({name, caption, icon, image, selected = false, onClick, onDoubleClick}: IconItemProps) => {
  const onItemClick = () => {
    if (onClick) {
      onClick(!selected);
    }
  };

  return (
    <FileDropdownActions trigger={['contextMenu']}>
      <div className={`file-item ${selected ? 'selected' : ''}`} onDoubleClick={onDoubleClick} onClick={onItemClick}>
        {image ? (
          <div className={'file-image'} style={{backgroundImage: `url(${image})`}}></div>
        ) : icon ? (
          icon
        ) : (
          <span className="icon icon-file-empty"></span>
        )}
        <span className={'file-name'}>{name}</span>
        {caption && <span className={'file-caption'}>{caption}</span>}
      </div>
    </FileDropdownActions>
  );
};

export default IconItem;
