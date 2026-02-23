import React, {useEffect, useState} from 'react';
import axios from "axios";

import type {ApiFile, Container, ContainerContent} from "../../../Types/api.tsx";
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import FolderItem from "../ContainerContentManager/FolderItem.tsx";
import FileItem from "../ContainerContentManager/FileItem.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import './styles.less';

interface ContainerContentViewerProps {
  searchValue?: string,
  orderBy?: string;
  containerUuid?: string;
  viewMode?: string;
  filter?: string;
  refresh?: boolean;
  onFolderNavigate?: (container:Container) => void;
  onFileSelected?: (file: ApiFile) => void;
  onFileExecuted?: (file: ApiFile) => void;
}

const ContainerContentViewer = (
  {
    orderBy,
    searchValue,
    containerUuid,
    refresh,
    viewMode,
    onFileExecuted,
    onFolderNavigate,
    onFileSelected,
    filter
  }: ContainerContentViewerProps) => {
  const [containerContent, setContainerContent] = useState<ContainerContent>();
  const [selectedFiles, setSelectedFiles] = useState<ApiFile[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        order_by: orderBy,
        filter: filter,
        search: searchValue,
      },
    };
    setLoading(true);
    axios
      .get(searchValue ? 'file-management/search' : `file-management/containers/${containerUuid}/view`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setContainerContent(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [containerUuid, refresh, orderBy, searchValue]);

  return (
    <div className={`files-container mode-${viewMode}`}>
      <LoadingIndicator visible={loading}/>
      {containerContent?.containers.map(c => (
        <FolderItem
          selected={selectedContainer?.uuid == c.uuid}
          size={viewMode == 'grid' ? 45 : 28}
          key={c.uuid}
          container={c}
          onDoubleClick={() => {
            if(onFolderNavigate) onFolderNavigate(c);
          }}
          onChange={() => setReload(!reload)}
          onClick={(selected) => {
            console.log('asdadsf')
            if (selected) {
              setSelectedContainer(c);
            } else {
              setSelectedContainer(undefined);
            }
          }}
        />
      ))}
      {containerContent?.files.map(file => (
        <FileItem
          size={viewMode == 'grid' ? 45 : 28}
          key={file.uuid}
          selected={selectedFiles.findIndex(f => f.uuid === file.uuid) != -1}
          file={file}
          //onChange={() => setReload(!reload)}
          onDoubleClick={() => onFileExecuted?.(file)}
          onClick={(_selected, evt) => {
            if (evt.shiftKey) {
              if (selectedFiles.findIndex(f => f.uuid === file.uuid) == -1) {
                setSelectedFiles([...selectedFiles, file]);
              } else {
                setSelectedFiles(selectedFiles.filter(f => f.uuid !== file.uuid));
              }
            } else {
              setSelectedFiles([file]);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ContainerContentViewer;
