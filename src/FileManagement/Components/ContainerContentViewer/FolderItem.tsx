import React from 'react';

import {Container} from '../../../Types/api';
import IconItem from './IconItem';
import ContainerDropdownActions from '../ContainerDropdownActions';
import dayjs from 'dayjs';

interface FolderItemProps {
  container: Container;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
  onChange?: () => void;
}

const FolderItem = ({container, onDoubleClick, onClick, onChange}: FolderItemProps) => {
  return (
    <ContainerDropdownActions container={container} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          onDoubleClick={onDoubleClick}
          caption={container.is_public ? 'Público' : 'Privado'}
          onClick={onClick}
          icon={<span className="icon icon-folder"></span>}
          name={container.name}
        />
      </div>
    </ContainerDropdownActions>
  );
};

export default FolderItem;
