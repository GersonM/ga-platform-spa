import React from 'react';

import {Container} from '../../../Types/api';
import IconItem from './IconItem';
import ContainerDropdownActions from '../ContainerDropdownActions';
import dayjs from 'dayjs';
import {PiFolder, PiFolderBold, PiFolderOpen, PiFolderOpenDuotone, PiFolderOpenLight} from 'react-icons/pi';

interface FolderItemProps {
  container: Container;
  size?: number;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
  onChange?: () => void;
}

const FolderItem = ({container, onDoubleClick, onClick, size = 35, onChange}: FolderItemProps) => {
  return (
    <ContainerDropdownActions container={container} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          onDoubleClick={onDoubleClick}
          caption={container.is_public ? 'Público' : 'Privado'}
          onClick={onClick}
          icon={<PiFolderOpenLight size={size} />}
          name={container.name}
        />
      </div>
    </ContainerDropdownActions>
  );
};

export default FolderItem;
