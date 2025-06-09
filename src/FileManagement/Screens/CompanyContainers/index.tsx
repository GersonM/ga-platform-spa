import {useContext, useEffect, useState} from 'react';
import {useParams, useNavigate, NavLink} from 'react-router-dom';
import {Empty, Popover, Space, Tooltip} from 'antd';
import {PlusCircleIcon} from '@heroicons/react/24/outline';
import {FiTrash2} from 'react-icons/fi';
import {TbReload} from 'react-icons/tb';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import ContainerForm from '../../Components/ContainerForm';
import ContainerNavItem from './ContainerNavItem';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ContainerContentViewer from '../../Components/ContainerContentViewer';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import type {Container} from '../../../Types/api';
import ServiceStatus from '../../Components/ServiceStatus';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import IconButton from '../../../CommonUI/IconButton';
import AuthContext from '../../../Context/AuthContext';
import UploadInformation from '../../Components/UploadInformation';
import './styles.less';

const CompanyContainers = () => {
  const [containers, setContainers] = useState<Array<Container>>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [openContainerCreator, setOpenContainerCreator] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const {user} = useContext(AuthContext);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`file-management/containers`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          if (response.status === 204) {
            setContainers([]);
          }
          setContainers(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const navigateToFolder = (uuid: string) => {
    navigate(`/file-management/${params.uuid}/containers/${uuid}`);
  };

  const currentContainer = params.child_uuid ? params.child_uuid : params.uuid;

  return (
    <>
      <ModuleSidebar
        title={'Gestor de archivos'}
        actions={
          <Space>
            <Tooltip title={'Recargar lista de contenedores'}>
              <IconButton icon={<TbReload size={18} />} small onClick={() => setReload(!reload)} />
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
              onOpenChange={value => {
                setOpenContainerCreator(value);
              }}
              trigger={'click'}>
              <Tooltip title={'Crear contenedor'} placement={'left'}>
                <IconButton icon={<PlusCircleIcon />} />
              </Tooltip>
            </Popover>
          </Space>
        }
        footer={<ServiceStatus />}>
        <ul className="list-items">
          <LoadingIndicator visible={loading} />
          {containers?.length === 0 && (
            <EmptyMessage message={'No tienes contenedores creados, haz clic en el + para crear uno'} />
          )}
          {containers && (
            <>
              {containers
                .filter(c => !c.is_locked || user?.roles?.includes('admin'))
                .map(c => (
                  <li key={c.uuid} className={params.uuid === c.uuid ? 'active' : ''}>
                    <ContainerNavItem container={c} onChange={() => setReload(!reload)} />
                  </li>
                ))}
              <li className={params.uuid === 'trash' ? 'active' : ''}>
                <NavLink to={`/file-management/trash`}>
                  <FiTrash2 className="icon" />
                  <span className="label">Elementos borrados</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </ModuleSidebar>
      <UploadInformation />
      <ModuleContent withSidebar>
        {currentContainer ? (
          <ContainerContentViewer
            allowUpload={params.uuid !== 'trash'}
            containerUuid={currentContainer}
            onChange={navigateToFolder}
          />
        ) : (
          <Empty description={'Seleccionar un contenedor para ver su contenido'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </ModuleContent>
    </>
  );
};

export default CompanyContainers;
