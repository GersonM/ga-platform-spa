import React from 'react';
import dayjs from 'dayjs';
import {PiFolderLockLight, PiFolderOpenLight} from 'react-icons/pi';

import {Container} from '../../../Types/api';
import IconItem from './IconItem';
import ContainerDropdownActions from '../ContainerDropdownActions';

interface FolderItemProps {
  container: Container;
  size?: number;
  selected?: boolean;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
  onChange?: () => void;
}

const FolderItem = ({container, onDoubleClick, onClick, size = 35, onChange, selected}: FolderItemProps) => {
  return (
    <ContainerDropdownActions container={container} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          selected={selected}
          onDoubleClick={onDoubleClick}
          caption={dayjs(container.created_at).format(' D/MM/YYYY H:mm')}
          onClick={onClick}
          icon={container.is_public ? <PiFolderOpenLight size={size} /> : <PiFolderLockLight size={size} />}
          name={container.name}
        />
      </div>
    </ContainerDropdownActions>
  );
};

export default FolderItem;
