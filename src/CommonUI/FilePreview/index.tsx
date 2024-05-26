import {Image, Popover} from 'antd';
import {EyeIcon, TrashIcon} from '@heroicons/react/16/solid';

import IconButton from '../IconButton';
import './styles.less';

interface FilePreviewProps {
  file: string;
  type?: string;
  name: string;
  onDelete?: () => void;
}

const FilePreview = ({file, type, name, onDelete}: FilePreviewProps) => {
  return (
    <div className={'file-preview-container'}>
      <div>{name}</div>
      <div className={'actions'}>
        <Popover
          content={
            type?.includes('image') ? (
              <Image
                placeholder={'Loading...'}
                loading={'lazy'}
                src={file}
                width={200}
              />
            ) : (
              <a
                href={file}
                target={'_blank'}>
                Open file
              </a>
            )
          }>
          <IconButton
            icon={<EyeIcon />}
            small
          />
        </Popover>
        {onDelete && (
          <IconButton
            danger
            small
            onClick={onDelete}
            icon={<TrashIcon />}
          />
        )}
      </div>
    </div>
  );
};

export default FilePreview;
