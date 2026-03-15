import React, {useEffect, useMemo, useState} from 'react';
import type {DataNode} from "antd/es/tree";
import {LuFolder, LuHardDrive, LuTrash2} from "react-icons/lu";
import axios from "axios";
import {Input, Tree, type TreeDataNode} from "antd";

import type {Container} from "../../../Types/api.tsx";
import ErrorHandler from "../../../Utils/ErrorHandler.tsx";

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

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    axios
      .get(`file-management/containers`, config)
      .then(response => {
        if (response) {
          const parseData: any[] = response.data?.map((c: Container) => ({
            title: c.name, key: c.uuid,
            icon: <LuHardDrive size={18} style={{verticalAlign: 'text-bottom'}}/>,
            isLeaf: !c.num_containers,
            children: c.containers?.map(sC => ({
              title: sC.name, key: sC.uuid,
              icon: sC.containers?.length ? undefined : <LuFolder size={14} style={{marginTop: 5}}/>,
              isLeaf: !sC.num_containers,
              children: sC.containers?.map(ssC => ({
                title: ssC.name, key: ssC.uuid,
                isLeaf: !ssC.num_containers,
                icon: ssC.containers?.length ? undefined : <LuFolder size={14} style={{marginTop: 5}}/>,
                children: ssC.containers?.map(sssC => ({
                  title: sssC.name,
                  key: sssC.uuid,
                  isLeaf: !sssC.num_containers,
                  icon: sssC.containers?.length ? undefined : <LuFolder size={14} style={{marginTop: 5}}/>,
                })),
              })),
            })),
          }));
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

  const searchTreeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(search);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + search.length);
        const title =
          index > -1 ? (
            <span key={item.key}>
              {beforeStr}
              <span className="site-tree-search-value" style={{color:'#ff0000'}}>{search}</span>
              {afterStr}
            </span>
          ) : (
            <span key={item.key}>{strTitle}</span>
          );
        if (item.children) {
          return {title, key: item.key, children: loop(item.children)};
        }

        return {
          title,
          key: item.key,
        };
      });

    if (treeData && search) {
      return loop(treeData);
    } else {
      return treeData;
    }
  }, [search, treeData]);

  return (
    <>
      <Input.Search placeholder="Buscar" allowClear value={search} onChange={e => setSearch(e.target.value)}/>
      <Tree.DirectoryTree
        rootStyle={{backgroundColor: 'transparent'}}
        selectedKeys={value ? [value as React.Key] : [currentContainer as React.Key]}
        showLine
        autoExpandParent={true}
        defaultExpandParent={true}
        loadData={onLoadData}
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
