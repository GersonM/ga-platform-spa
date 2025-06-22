import dayjs from 'dayjs';

import IconItem from './IconItem';
import FileIcon from '../FileIcon';
import type {ApiFile} from '../../../Types/api';
import FileDropdownActions from '../FileDropdownActions';

interface FileItemProps {
  file: ApiFile;
  selected?: boolean;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean, evt: any) => void;
  onChange?: () => void;
  size?: number;
}

const FileItem = ({file, onDoubleClick, onClick, selected, onChange, size = 45}: FileItemProps) => {
  return (
    <FileDropdownActions file={file} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          selected={selected}
          caption={dayjs(file.created_at).format(' D/MM/YYYY H:mm')}
          name={file.name}
          image={size > 40 ? file.thumbnail : undefined}
          icon={<FileIcon file={file} size={size} />}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      </div>
    </FileDropdownActions>
  );
};

export default FileItem;
