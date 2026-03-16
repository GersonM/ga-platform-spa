import React, {useEffect, useMemo, useState} from 'react';
import type {DataNode} from "antd/es/tree";
import {LuFolder, LuHardDrive, LuTrash2} from "react-icons/lu";
import axios from "axios";
import {Input, Tree, type TreeDataNode} from "antd";

import type {Container} from "../../../Types/api.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import './styles.less';
import dayjs from "dayjs";

interface ContainersTreeNavigatorProps {
  value?: string;
  onChange?: (value: string, container?: Container) => void;
  refresh?: boolean;
  showTrash?: boolean;
}

const ContainersTreeNavigator = ({value, onChange, refresh, showTrash}: ContainersTreeNavigatorProps) => {
  const [treeData, setTreeData] = useState<DataNode[]>();
  const [currentContainer, setCurrentContainer] = useState<string>();
  const [search, setSearch] = useState<string>('');

  const getTreeNodes:any = (container: Container) => {
    return {
      title: container.name,
      key: container.uuid,
      caption: dayjs(container.created_at).fromNow(),
      icon: container.parent_container_uuid ? undefined : <LuHardDrive />,
      isLeaf: container.containers?.length == 0,
      children: container.containers?.map(getTreeNodes)
    };
  }

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    axios
      .get(`file-management/containers`, config)
      .then(response => {
        if (response) {
          const parseData: DataNode[] = response.data?.map(getTreeNodes);
          if (showTrash) {
            parseData.push({
              title: 'Papelera',
              key: 'trash',
              isLeaf: true,
              icon: <LuTrash2 size={18} style={{marginTop: 3}}/>,
            });
          }
          setTreeData(parseData);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [refresh]);

  const searchTreeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.filter((item) => {
        const strTitle = item.title as string;
        const exist = strTitle.toLowerCase().includes(search.toLowerCase());
        let hasChildren = false;
        if (item.children) {
          item.children = loop(item.children.map((child: any) => ({...child})));
          hasChildren = item.children.length > 0;
        }
        return exist || hasChildren;
      });

    if (treeData && search) {
      return loop(treeData.map(o => ({...o})));
    } else {
      return treeData;
    }
  }, [search, treeData]);

  return (
    <>
      <Input placeholder="Buscar carpetas" style={{marginBottom: 5}} allowClear value={search}
             onChange={e => setSearch(e.target.value)}/>
      <Tree.DirectoryTree
        rootStyle={{backgroundColor: 'transparent'}}
        selectedKeys={value ? [value as React.Key] : [currentContainer as React.Key]}
        titleRender={(node: any) => {
          return <div className={'containers-tree-node'}>{node.icon || <LuFolder/>}
            <div className={'label'}>
              {node.title as string}
              {node.caption && node.key != 'trash' && <small>{node.caption}</small>}
            </div>
          </div>;
        }}
        showIcon={false}
        treeData={searchTreeData}
        onSelect={keys => {
          if (keys.length == 0) return;
          setCurrentContainer(keys[0] as string);
          if (onChange) onChange(keys[0] as string);
        }}
      />
    </>
  );
};

export default ContainersTreeNavigator;
