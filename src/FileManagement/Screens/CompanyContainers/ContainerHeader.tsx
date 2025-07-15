import {useEffect, useState} from 'react';
import {Button, Input, Popover, Segmented, Select, Tooltip} from 'antd';
import {AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import {TbFolderPlus, TbInfoCircle, TbSearch} from "react-icons/tb";
import {PiUpload} from 'react-icons/pi';

import ContainerForm from '../../Components/ContainerForm';
import type {Container} from '../../../Types/api';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';

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
  const [orderBy, setOrderBy] = useState('date_desc');

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

  useEffect(() => {
    if (onChangeOrder) {
      onChangeOrder(orderBy);
    }
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
            <Button type={'text'} onClick={onOpenUpload} icon={<PiUpload size={20}/>}>
              Cargar archivos
            </Button>
          )}
          <Tooltip title={'Mostrar panel de información'} placement={'bottomRight'}>
            <Button
              type={"primary"}
              ghost={!informationEnabled}
              onClick={() => setInformationEnabled(!informationEnabled)}
              icon={<TbInfoCircle size={22}/>}
            />
          </Tooltip>
          <Tooltip title={'Buscar'}>
            <Popover
              placement={'bottomRight'}
              content={
                <>
                  <Input.Search
                    placeholder={'Buscar'}
                    onSearch={value => {
                      if (onSearch) {
                        onSearch(value);
                      }
                    }}
                  />
                </>
              }
              trigger={'click'}>
              <Button type={'text'} onClick={upLevel} icon={<TbSearch size={18}/>}/>
            </Popover>
          </Tooltip>
          <Tooltip title={'Nuevo folder'}>
            <Popover
              placement={'bottomRight'}
              content={<ContainerForm containerUuid={container.uuid} onCompleted={onChange}/>}
              trigger={'click'}>
              <Button type={'text'} icon={<TbFolderPlus size={20}/>}/>
            </Popover>
          </Tooltip>
          <Select
            prefix={'Ordenar'}
            value={orderBy}
            popupMatchSelectWidth={false}
            onChange={setOrderBy}
            placeholder={'Nombre'}
            options={[
              {label: 'nuevos primero', value: 'date_desc'},
              {label: 'por nombre A-Z', value: 'name'},
              {label: 'antiguos primero', value: 'date_asc'},
              {label: 'pesados primero', value: 'size_desc'},
              {label: 'ligeros primero', value: 'size_asc'},
            ]}
          />
          <Segmented
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
