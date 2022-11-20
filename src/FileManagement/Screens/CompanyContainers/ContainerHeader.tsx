import React, {useEffect, useState} from 'react';
import {Button, Popover, Radio, Space, Tooltip} from 'antd';
import ButtonGroup from 'antd/lib/button/button-group';

import CreateContainer from '../../Components/CreateContainer/index.';
import {Container} from '../../../Types/api';

interface ContainerHeaderProps {
  container: Container;
  onChange?: () => void;
  onToggleInformation?: (enabled: boolean) => void;
  upLevel?: () => void;
  onChangeViewMode?: (viewMode: string) => void;
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
  const [viewMode, setViewMode] = useState('grid');
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
        <h1>{container.name}</h1>
      </div>
      <Space>
        <Button type={'primary'} onClick={onOpenUpload} icon={<span className="button-icon icon-upload2" />}>
          Cargar archivos
        </Button>
        <ButtonGroup>
          <Tooltip title={'Mostrar panel de información'} placement={'bottomRight'}>
            <Button
              type={informationEnabled ? 'primary' : 'default'}
              onClick={() => setInformationEnabled(!informationEnabled)}
              icon={<span className="button-icon-alone icon-notification-circle"></span>}
            />
          </Tooltip>
        </ButtonGroup>
        <ButtonGroup>
          <Tooltip title={'Subir un nivel'}>
            <Button onClick={upLevel} icon={<span className="button-icon-alone icon-folder-upload"></span>} />
          </Tooltip>
          <Tooltip title={'Nuevo folder'}>
            <Popover
              content={<CreateContainer containerUuid={container.uuid} onCompleted={onChange} />}
              trigger={'click'}>
              <Button icon={<span className="button-icon-alone icon-folder-plus"></span>} />
            </Popover>
          </Tooltip>
        </ButtonGroup>
        <Tooltip title={'Cambiar tipo de vista'} placement={'bottomRight'}>
          <Radio.Group
            size={'small'}
            buttonStyle={'solid'}
            onChange={({target}) => setViewMode(target.value)}
            value={viewMode}>
            <Radio.Button value="list">
              <span className="icon-list4"></span>
            </Radio.Button>
            <Radio.Button value="grid">
              <span className="icon-icons2"></span>
            </Radio.Button>
          </Radio.Group>
        </Tooltip>
      </Space>
    </div>
  );
};

export default ContainerHeader;
