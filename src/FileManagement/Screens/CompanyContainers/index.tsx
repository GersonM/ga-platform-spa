import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Empty, Popover, Tooltip} from 'antd';
import {TbPlus, TbRefresh} from 'react-icons/tb';

import ContainerForm from '../../Components/ContainerForm';
import ContainerContentManager from '../../Components/ContainerContentManager';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import type {Container} from '../../../Types/api';
import ServiceStatus from '../../Components/ServiceStatus';
import IconButton from '../../../CommonUI/IconButton';
import ContainersTreeNavigator from "../../Components/ContainersTreeNavigator";
import './styles.less';

const CompanyContainers = () => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [openContainerCreator, setOpenContainerCreator] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  const currentContainer = params.child_uuid ? params.child_uuid : params.uuid;

  return (
    <>
      <ModuleSidebar
        title={'Gestor de archivos'}
        actions={
          <>
            <Tooltip title={'Recargar lista de contenedores'}>
              <IconButton icon={<TbRefresh/>} loading={loading} small onClick={() => setReload(!reload)}/>
            </Tooltip>
            <Popover
              open={openContainerCreator}
              content={
                <ContainerForm
                  onCompleted={() => {
                    setReload(!reload);
                    setOpenContainerCreator(false);
                  }}
                />
              }
              onOpenChange={value => setOpenContainerCreator(value)}
              trigger={'click'}>
              <Tooltip title={'Crear contenedor'} placement={'left'}>
                <IconButton small icon={<TbPlus/>}/>
              </Tooltip>
            </Popover>
          </>
        }
        footer={<ServiceStatus/>}>
        <ContainersTreeNavigator
          refresh={reload}
          onChange={(uuid: string, container?: Container) => navigate(`/file-management/${uuid}`)}
          value={params?.uuid}
        />
      </ModuleSidebar>

      <ModuleContent withSidebar>
        {currentContainer ? (
          <ContainerContentManager
            allowUpload={params.uuid !== 'trash'}
            containerUuid={currentContainer}
            onChange={(uuid: string) => navigate(`/file-management/${uuid}`)}
          />
        ) : (
          <Empty description={'Seleccionar un contenedor para ver su contenido'} image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        )}
      </ModuleContent>
    </>
  );
};

export default CompanyContainers;
