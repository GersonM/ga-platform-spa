import React from 'react';

import {File} from '../../../Types/api';
import IconItem from './IconItem';
import FileIcon from '../FileIcon';

interface FileItemProps {
  file: File;
  selected?: boolean;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
}

const FileItem = ({file, onDoubleClick, onClick, selected}: FileItemProps) => {
  return (
    <IconItem
      selected={selected}
      name={file.name}
      icon={<FileIcon file={file} />}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    />
  );
};

export default FileItem;
