import React from 'react';
import dayjs from 'dayjs';

import {ApiFile} from '../../../Types/api';
import IconItem from './IconItem';
import FileIcon from '../FileIcon';
import FileDropdownActions from '../FileDropdownActions';

interface FileItemProps {
  file: ApiFile;
  selected?: boolean;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
  onChange?: () => void;
  size?: number;
}

const FileItem = ({file, onDoubleClick, onClick, selected, onChange, size}: FileItemProps) => {
  const isImage = file.type.includes('image');
  return (
    <FileDropdownActions file={file} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          selected={selected}
          caption={dayjs(file.created_at).format(' D/MM/YYYY H:mm')}
          name={file.name}
          image={isImage ? file.thumbnail : undefined}
          icon={<FileIcon file={file} size={size} />}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      </div>
    </FileDropdownActions>
  );
};

export default FileItem;
