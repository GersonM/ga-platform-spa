import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Empty, Popover, Tooltip, Tree} from 'antd';
import {LuFolder, LuHardDrive} from "react-icons/lu";
import {TbPlus, TbRefresh} from 'react-icons/tb';
import axios from 'axios';

import ErrorHandler from '../../../Utils/ErrorHandler';
import ContainerForm from '../../Components/ContainerForm';
import ContainerContentViewer from '../../Components/ContainerContentViewer';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import type {Container} from '../../../Types/api';
import ServiceStatus from '../../Components/ServiceStatus';
import EmptyMessage from '../../../CommonUI/EmptyMessage';
import IconButton from '../../../CommonUI/IconButton';
import './styles.less';

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

const CompanyContainers = () => {
  const [containers, setContainers] = useState<Array<Container>>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [openContainerCreator, setOpenContainerCreator] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<DataNode[]>();

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
          setTreeData(response.data?.map((c: Container) => ({
            title: c.name, key: c.uuid,
            icon: <LuHardDrive size={16} style={{verticalAlign: 'middle'}}/>,
            children: c.containers?.map(sC => ({
              title: sC.name, key: sC.uuid,
              icon: <LuHardDrive size={16} style={{verticalAlign: 'middle'}}/>,
              children: sC.containers?.map(ssC => ({
                title: ssC.name, key: ssC.uuid,
                icon: <LuHardDrive size={16} style={{verticalAlign: 'middle'}}/>,
              })),
            })),
          })));
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });

  const navigateToFolder = (uuid: string) => {
    navigate(`/file-management/${params.uuid}/containers/${uuid}`);
  };

  const currentContainer = params.child_uuid ? params.child_uuid : params.uuid;

  const onLoadData = async ({key}: any) => {
    const result = await axios.get(`file-management/containers/${key}/view`)
    setTreeData((origin) => {
      if (origin) {
        return updateTreeData(origin, key, result.data.containers?.map((c: Container) => ({
          title: c.name, key: c.uuid,
          icon: <LuFolder size={16} style={{verticalAlign: 'middle'}}/>
        })))
      }
    });
  };

  return (
    <>
      <ModuleSidebar
        title={'Gestor de archivos'}
        actions={
          <>
            <Tooltip title={'Recargar lista de contenedores'}>
              <IconButton icon={<TbRefresh/>} small onClick={() => setReload(!reload)}/>
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
        {containers?.length === 0 && (
          <EmptyMessage message={'No tienes contenedores creados, haz clic en el + para crear uno'}/>
        )}
        <Tree
          showIcon
          defaultSelectedKeys={params?.uuid ? [params?.uuid] : undefined}
          showLine
          loadData={onLoadData}
          treeData={treeData}
          onSelect={keys => {
            navigate(`/file-management/${keys[0]}`);
          }}
        />
      </ModuleSidebar>

      <ModuleContent withSidebar>
        {currentContainer ? (
          <ContainerContentViewer
            allowUpload={params.uuid !== 'trash'}
            containerUuid={currentContainer}
            onChange={navigateToFolder}
          />
        ) : (
          <Empty description={'Seleccionar un contenedor para ver su contenido'} image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        )}
      </ModuleContent>
    </>
  );
};

export default CompanyContainers;
