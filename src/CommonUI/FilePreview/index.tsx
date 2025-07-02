import {useEffect, useState} from "react";
import {Image, Popover} from 'antd';
import {TrashIcon} from '@heroicons/react/16/solid';
import axios from 'axios';

import IconButton from '../IconButton';
import type {ApiFile} from "../../Types/api.tsx";
import LoadingIndicator from "../LoadingIndicator";
import FileIcon from "../../FileManagement/Components/FileIcon";
import './styles.less';

interface FilePreviewProps {
  fileUuid: string;
  onDelete?: () => void;
}

const FilePreview = ({fileUuid, onDelete}: FilePreviewProps) => {
  const [file, setFile] = useState<ApiFile>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`file-management/files/${fileUuid}`, config)
      .then(response => {
        if (response) {
          setFile(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, []);


  return (
    <div className={'file-preview-container'}>
      <LoadingIndicator overlay={true} visible={loading}/>
        <Popover
          content={
            <>
              <p>{file?.name}</p>
            {file?.thumbnail &&
              <Image loading={'lazy'} src={file?.thumbnail} width={200}/>}
            </>
          }>
          {file &&
            <IconButton
              href={file?.source}
              target={'_blank'}
              icon={<FileIcon file={file} size={22}/>}
            />
          }
        </Popover>
        {onDelete && (
          <IconButton
            danger
            small
            onClick={onDelete}
            icon={<TrashIcon/>}
          />
        )}
    </div>
  );
};

export default FilePreview;
