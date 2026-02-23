import {PiFile} from 'react-icons/pi';
import type {ReactNode} from "react";

interface IconItemProps {
  size?: number;
  name: string;
  caption?: ReactNode;
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
    <a
      title={name}
      className={`file-item ${selected ? 'selected' : ''}`}
      onDoubleClick={onDoubleClick}
      onClick={onItemClick}>
      <div className={'file-image'} style={image ? {backgroundColor: '#ffffff', backgroundImage: `url(${image})`} : {}}>
        {!image ? icon ? icon : <PiFile color={'#444444'} size={20} /> : null}
      </div>
      <div className={'file-item-info'}>
        <span className={'file-name'}>{name}</span>
        {caption && <code className={'file-caption'}>{caption}</code>}
      </div>
    </a>
  );
};

export default IconItem;
