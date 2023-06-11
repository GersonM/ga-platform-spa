import React, {useEffect, useState} from 'react';
import {Button, Popover, Segmented, Space, Tooltip} from 'antd';
import {AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

import CreateContainer from '../../Components/CreateContainer';
import {Container} from '../../../Types/api';
import {ArrowUpIcon, FolderPlusIcon, InformationCircleIcon} from '@heroicons/react/24/outline';

interface ContainerHeaderProps {
  container: Container;
  onChange?: () => void;
  onToggleInformation?: (enabled: boolean) => void;
  upLevel?: () => void;
  onChangeViewMode?: (viewMode: string | number) => void;
  onOpenUpload?: () => void;
}

const ContainerHeader = ({
  container,
  onChange,
  onToggleInformation,
  upLevel,
  onChangeViewMode,
  onOpenUpload,
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

  return (
    <div className={'container-header-wrapper'}>
      <div className={'name'}>
        <h1>
          {container.name}
          <small>
            Última modificación: <br />
            {dayjs(container.updated_at).format(' D/MM/YYYY [a las] H:mm')}
          </small>
        </h1>
      </div>
      <Space>
        <Button type={'primary'} onClick={onOpenUpload} icon={<span className="button-icon icon-upload2" />}>
          Cargar archivos
        </Button>
        <Tooltip title={'Mostrar panel de información'} placement={'bottomRight'}>
          <Button
            type={informationEnabled ? 'primary' : 'default'}
            onClick={() => setInformationEnabled(!informationEnabled)}
            icon={<InformationCircleIcon height={24} />}
          />
        </Tooltip>
        <Tooltip title={'Subir un nivel'}>
          <Button type={'text'} onClick={upLevel} icon={<ArrowUpIcon height={24} />} />
        </Tooltip>
        <Tooltip title={'Nuevo folder'}>
          <Popover
            placement={'bottomRight'}
            content={<CreateContainer containerUuid={container.uuid} onCompleted={onChange} />}
            trigger={'click'}>
            <Button type={'text'} icon={<FolderPlusIcon height={23} />} />
          </Popover>
        </Tooltip>
        <Segmented
          onResize={() => {}}
          onResizeCapture={() => {}}
          options={[
            {
              value: 'list',
              icon: <BarsOutlined />,
            },
            {
              value: 'grid',
              icon: <AppstoreOutlined />,
            },
          ]}
          value={viewMode}
          onChange={setViewMode}
        />
      </Space>
    </div>
  );
};

export default ContainerHeader;
