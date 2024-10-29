import React, {useEffect, useState} from 'react';
import {Button, Popover, Segmented, Tooltip} from 'antd';
import {AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import {CloudArrowUpIcon} from '@heroicons/react/24/solid';
import {BsSortAlphaDown, BsSortNumericDown} from 'react-icons/bs';
import {ArrowUpIcon, FolderPlusIcon, InformationCircleIcon} from '@heroicons/react/24/outline';

import ContainerForm from '../../Components/ContainerForm';
import {Container} from '../../../Types/api';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface ContainerHeaderProps {
  container: Container;
  onChange?: () => void;
  onToggleInformation?: (enabled: boolean) => void;
  upLevel?: () => void;
  onChangeViewMode?: (viewMode: string | number) => void;
  onChangeOrder?: (order: string) => void;
  onOpenUpload?: () => void;
  onReload?: () => void;
}

const ContainerHeader = ({
  container,
  onChange,
  onToggleInformation,
  upLevel,
  onChangeViewMode,
  onOpenUpload,
  onChangeOrder,
  onReload,
}: ContainerHeaderProps) => {
  const [viewMode, setViewMode] = useState<string | number>('grid');
  const [informationEnabled, setInformationEnabled] = useState(true);
  const [orderBy, setOrderBy] = useState('name');

  useEffect(() => {
    if (window.innerWidth < 600) {
      setInformationEnabled(false);
    }
  }, []);

  useEffect(() => {
    onChangeViewMode && onChangeViewMode(viewMode);
  }, [onChangeViewMode, viewMode]);

  useEffect(() => {
    onToggleInformation && onToggleInformation(informationEnabled);
  }, [informationEnabled, onToggleInformation]);

  useEffect(() => {
    onChangeOrder && onChangeOrder(orderBy);
  }, [orderBy, onChangeOrder]);

  return (
    <ContentHeader
      backLocation={container.parent_container?.uuid}
      onRefresh={onReload}
      bordered
      title={container.name}
      description={container.parent_container?.name}
      tools={
        <>
          <PrimaryButton onClick={onOpenUpload} icon={<CloudArrowUpIcon />}>
            Cargar archivos
          </PrimaryButton>
          <Tooltip title={'Mostrar panel de información'} placement={'bottomRight'}>
            <Button
              type={informationEnabled ? 'primary' : 'default'}
              onClick={() => setInformationEnabled(!informationEnabled)}
              icon={<InformationCircleIcon height={20} />}
            />
          </Tooltip>
          <Tooltip title={'Subir un nivel'}>
            <Button type={'text'} onClick={upLevel} icon={<ArrowUpIcon height={20} />} />
          </Tooltip>
          <Tooltip title={'Nuevo folder'}>
            <Popover
              placement={'bottomRight'}
              content={<ContainerForm containerUuid={container.uuid} onCompleted={onChange} />}
              trigger={'click'}>
              <Button type={'text'} icon={<FolderPlusIcon height={20} />} />
            </Popover>
          </Tooltip>
          <Tooltip title={'Ordenar nombre o fecha'}>
            <Segmented
              onResize={() => {}}
              onResizeCapture={() => {}}
              options={[
                {
                  value: 'name',
                  icon: <BsSortAlphaDown />,
                  title: 'Nombre',
                },
                {
                  value: 'date',
                  icon: <BsSortNumericDown />,
                  title: 'Fecha',
                },
              ]}
              value={orderBy}
              onChange={setOrderBy}
            />
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
        </>
      }
    />
  );
};

export default ContainerHeader;
