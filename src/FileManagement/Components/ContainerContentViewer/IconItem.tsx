import {PiFile} from 'react-icons/pi';
import type {ReactNode} from "react";

interface IconItemProps {
  size?: number;
  name: string;
  caption?: string;
  selected?: boolean;
  icon?: ReactNode;
  image?: string;
  onClick?: (selected: boolean, evt: any) => void;
  onDoubleClick?: () => void;
}

const IconItem = ({name, caption, icon, image, selected = false, onClick, onDoubleClick}: IconItemProps) => {
  const onItemClick = (evt: any) => {
    if (onClick) {
      onClick(!selected, evt);
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
