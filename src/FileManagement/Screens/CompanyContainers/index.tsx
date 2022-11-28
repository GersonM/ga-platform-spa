import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams, useNavigate, NavLink} from 'react-router-dom';
import {Button, Empty, Popover, Tooltip} from 'antd';

import './styles.less';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CreateContainer from '../../Components/CreateContainer/index.';
import ContainerNavItem from './ContainerNavItem';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import ContainerContentViewer from '../../Components/ContainerContentViewer';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import {Container} from '../../../Types/api';
import ServiceStatus from '../../Components/ServiceStatus';

const CompanyContainers = () => {
  const [containers, setContainers] = useState<Array<Container>>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [openContainerCreator, setOpenContainerCreator] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

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
    navigate(`/file-management/containers/${uuid}`);
  };

  return (
    <>
      <ModuleSidebar
        title={'Gestor de archivos'}
        actions={
          <Popover
            open={openContainerCreator}
            content={
              <CreateContainer
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
              <Button type={'primary'} shape={'circle'} size={'small'} ghost>
                <span className="icon-plus"></span>
              </Button>
            </Tooltip>
          </Popover>
        }
        footer={<ServiceStatus />}>
        <ul className="list-items">
          <LoadingIndicator visible={loading} />
          {containers?.length === 0 && (
            <Empty description={'No tienes contenedores creados, haz clic en el + para crear uno'} />
          )}
          {containers && (
            <>
              {containers.map(c => (
                <li key={c.uuid}>
                  <ContainerNavItem container={c} onChange={() => setReload(!reload)} />
                </li>
              ))}
              <li>
                <NavLink to={`/file-management/containers/trash`}>
                  <span className="icon icon-trash3"></span>
                  <span className="label">
                    Elementos borrados
                    <small>10 elementos</small>
                  </span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </ModuleSidebar>
      <ModuleContent>
        {params.uuid ? (
          <ContainerContentViewer containerUuid={params.uuid} onChange={navigateToFolder} />
        ) : (
          <Empty description={'Seleccionar un contenedor para ver su contenido'} />
        )}
      </ModuleContent>
    </>
  );
};

export default CompanyContainers;
