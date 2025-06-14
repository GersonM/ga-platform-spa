import {useEffect, useState} from 'react';
import {Button, Input, Popover, Segmented, Select, Tooltip} from 'antd';
import {AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import {CloudArrowUpIcon} from '@heroicons/react/24/solid';
import {PiArrowUp, PiFolderSimplePlus, PiMagnifyingGlass} from 'react-icons/pi';
import {InformationCircleIcon} from '@heroicons/react/24/outline';

import ContainerForm from '../../Components/ContainerForm';
import type {Container} from '../../../Types/api';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface ContainerHeaderProps {
  container: Container;
  onChange?: () => void;
  onToggleInformation?: (enabled: boolean) => void;
  upLevel?: () => void;
  onChangeViewMode?: (viewMode: string | number) => void;
  onSearch?: (search: string) => void;
  onChangeOrder?: (order: string) => void;
  onOpenUpload?: () => void;
  allowUpload?: boolean;
  onReload?: () => void;
}

const ContainerHeader = ({
  container,
  onChange,
  onToggleInformation,
  upLevel,
  onChangeViewMode,
  onOpenUpload,
  allowUpload,
  onSearch,
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
          {allowUpload && (
            <PrimaryButton onClick={onOpenUpload} icon={<CloudArrowUpIcon />}>
              Cargar archivos
            </PrimaryButton>
          )}
          <Tooltip title={'Mostrar panel de información'} placement={'bottomRight'}>
            <Button
              type={informationEnabled ? 'primary' : 'default'}
              onClick={() => setInformationEnabled(!informationEnabled)}
              icon={<InformationCircleIcon />}
            />
          </Tooltip>
          <Tooltip title={'Subir un nivel'}>
            <Button type={'text'} onClick={upLevel} icon={<PiArrowUp size={18} />} />
          </Tooltip>
          <Tooltip title={'Buscar'}>
            <Popover
              placement={'bottomRight'}
              content={
                <>
                  <Input.Search
                    placeholder={'Buscar'}
                    onSearch={value => {
                      onSearch && onSearch(value);
                    }}
                  />
                </>
              }
              trigger={'click'}>
              <Button type={'text'} onClick={upLevel} icon={<PiMagnifyingGlass size={18} />} />
            </Popover>
          </Tooltip>
          <Tooltip title={'Nuevo folder'}>
            <Popover
              placement={'bottomRight'}
              content={<ContainerForm containerUuid={container.uuid} onCompleted={onChange} />}
              trigger={'click'}>
              <Button type={'text'} icon={<PiFolderSimplePlus size={18} />} />
            </Popover>
          </Tooltip>
          <Select
            prefix={'Ordenar'}
            value={orderBy}
            onChange={setOrderBy}
            placeholder={'Nombre'}
            options={[
              {label: 'por nombre A-Z', value: 'name'},
              {label: 'nuevos primero', value: 'date'},
              {label: 'antiguos primero', value: 'date_desc'},
              {label: 'pesados primero', value: 'size_asc'},
              {label: 'ligeros primero', value: 'size_desc'},
            ]}
          />
          <Segmented
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
