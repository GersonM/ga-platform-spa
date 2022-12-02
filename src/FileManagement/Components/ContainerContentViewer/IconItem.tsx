import React from 'react';
import {Dropdown} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

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

const menuItems: ItemType[] = [
  {
    label: 'Mover a otro contenedor',
    key: 'move',
    disabled: true,
  },
  {
    label: 'Renombrar',
    key: 'rename',
    disabled: true,
  },
  {
    type: 'divider',
  },
  {
    label: 'Borrar',
    key: 'delete',
    disabled: true,
  },
];

const IconItem = ({name, caption, icon, image, selected = false, onClick, onDoubleClick}: IconItemProps) => {
  const onItemClick = () => {
    if (onClick) {
      onClick(!selected);
    }
  };

  return (
    <Dropdown menu={{items: menuItems}} trigger={['contextMenu']}>
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
    </Dropdown>
  );
};

export default IconItem;
