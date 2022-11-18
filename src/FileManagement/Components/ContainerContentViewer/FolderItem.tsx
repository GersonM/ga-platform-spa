import React from 'react';

import {Container} from '../../../Types/api';
import IconItem from './IconItem';

interface FolderItemProps {
  container: Container;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
}

const FolderItem = ({container, onDoubleClick, onClick}: FolderItemProps) => {
  return (
    <IconItem
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      icon={<span className="icon icon-folder"></span>}
      name={container.name}
    />
  );
};

export default FolderItem;
