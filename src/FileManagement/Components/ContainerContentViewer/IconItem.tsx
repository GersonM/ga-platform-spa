import React from 'react';
import {Dropdown, Menu} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

interface IconItemProps {
  size?: 'large' | 'small';
  name: string;
  selected?: boolean;
  icon?: React.ReactNode;
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

const IconItem = ({name, icon, selected = false, onClick, onDoubleClick}: IconItemProps) => {
  const onItemClick = () => {
    if (onClick) {
      onClick(!selected);
    }
  };

  return (
    <Dropdown overlay={<Menu items={menuItems} />} trigger={['contextMenu']}>
      <div className={`file-item ${selected ? 'selected' : ''}`} onDoubleClick={onDoubleClick} onClick={onItemClick}>
        {icon ? icon : <span className="icon icon-file-empty"></span>}
        <span className={'file-name'}>{name}</span>
      </div>
    </Dropdown>
  );
};

export default IconItem;
