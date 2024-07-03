import React, {useEffect, useState} from 'react';
import {Button, Popover, Segmented, Tooltip} from 'antd';
import {AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import {CloudArrowUpIcon} from '@heroicons/react/24/solid';

import CreateContainer from '../../Components/CreateContainer';
import {Container} from '../../../Types/api';
import {ArrowUpIcon, FolderPlusIcon, InformationCircleIcon} from '@heroicons/react/24/outline';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import * as tus from 'tus-js-client';

interface ContainerHeaderProps {
  container: Container;
  onChange?: () => void;
  onToggleInformation?: (enabled: boolean) => void;
  upLevel?: () => void;
  onChangeViewMode?: (viewMode: string | number) => void;
  onOpenUpload?: () => void;
  onReload?: () => void;
}

const uploadFile = (file: File) => {
  const chunkSize = 5 * 1024 * 1024;
  const upload = new tus.Upload(file, {
    endpoint: 'http://localhost:8080/files/',
    chunkSize: chunkSize,
    retryDelays: [0, 1000, 3000, 5000],
    metadata: {
      filename: (file as File).name,
      filetype: (file as File).type
    },
    onError: (error) => {
      console.log('Failed because: ' + error);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      console.log(bytesUploaded, bytesTotal, percentage + '%');
    },
    onSuccess: () => {
      console.log('Download %s from %s', (upload.file as File).name, upload.url);
    }
  });

  upload.start();
};

const ContainerHeader = ({
  container,
  onChange,
  onToggleInformation,
  upLevel,
  onChangeViewMode,
  onOpenUpload,
  onReload,
}: ContainerHeaderProps) => {
  const [viewMode, setViewMode] = useState<string | number>('grid');
  const [informationEnabled, setInformationEnabled] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 600) {
      setInformationEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (onChangeViewMode) {
      onChangeViewMode(viewMode);
    }
  }, [onChangeViewMode, viewMode]);

  useEffect(() => {
    if (onToggleInformation) {
      onToggleInformation(informationEnabled);
    }
  }, [informationEnabled, onToggleInformation]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <ContentHeader
      backLocation={container.parent_container?.uuid}
      onRefresh={onReload}
      bordered
      title={container.name}
      description={container.parent_container?.name}
      tools={
        <>
          <input
            type="file"
            style={{display: 'none'}}
            id="fileInput"
            onChange={handleFileSelect}
          />
          <PrimaryButton onClick={() => document.getElementById('fileInput')!.click()} icon={<CloudArrowUpIcon/>}>
            Cargar archivos
          </PrimaryButton>
          <Tooltip title={'Mostrar panel de información'} placement={'bottomRight'}>
            <Button
                    type={informationEnabled ? 'primary' : 'default'}
                    onClick={() => setInformationEnabled(!informationEnabled)}
                    icon={<InformationCircleIcon height={20}/>}
            />
          </Tooltip>
          <Tooltip title={'Subir un nivel'}>
            <Button type={'text'} onClick={upLevel} icon={<ArrowUpIcon height={20}/>}/>
          </Tooltip>
          <Tooltip title={'Nuevo folder'}>
            <Popover
              placement={'bottomRight'}
              content={<CreateContainer containerUuid={container.uuid} onCompleted={onChange}/>}
              trigger={'click'}>
              <Button type={'text'} icon={<FolderPlusIcon height={20}/>}/>
            </Popover>
          </Tooltip>
          <Segmented
            onResize={() => {
            }}
            onResizeCapture={() => {
            }}
            options={[
              {
                value: 'list',
                icon: <BarsOutlined/>,
              },
              {
                value: 'grid',
                icon: <AppstoreOutlined/>,
              },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        </>
      }
    />
  );
};

export default ContainerHeader;
