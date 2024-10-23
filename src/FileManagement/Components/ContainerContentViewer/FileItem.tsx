import React from 'react';
import dayjs from 'dayjs';

import {File} from '../../../Types/api';
import IconItem from './IconItem';
import FileIcon from '../FileIcon';
import FileDropdownActions from '../FileDropdownActions';

interface FileItemProps {
  file: File;
  selected?: boolean;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
  onChange?: () => void;
}

const FileItem = ({file, onDoubleClick, onClick, selected, onChange}: FileItemProps) => {
  const isImage = file.type.includes('image');
  return (
    <FileDropdownActions file={file} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          selected={selected}
          caption={dayjs(file.created_at).format(' D/MM/YYYY H:mm')}
          name={file.name}
          image={isImage ? file.thumbnail : undefined}
          icon={<FileIcon file={file} size={45} />}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      </div>
    </FileDropdownActions>
  );
};

export default FileItem;
