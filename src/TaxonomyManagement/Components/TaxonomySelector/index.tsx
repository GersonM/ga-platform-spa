import React, {useEffect, useState} from 'react';
import {TreeSelect, TreeSelectProps} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {TaxonomyDefinition} from '../../../Types/api';

interface ITaxonomySelectorProps {
  value?: any;
  onChange?: (value: any) => void;
}

const TaxonomySelector = ({value, ...props}: ITaxonomySelectorProps) => {
  const [taxonomy, setTaxonomy] = useState<TaxonomyDefinition[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        code: 'courses',
      },
    };

    axios
      .get(`taxonomy/definitions`, config)
      .then(response => {
        if (response) {
          setTaxonomy(response.data[0].children);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  const onLoadData: TreeSelectProps['loadData'] = ({id}) =>
    axios
      .get(`taxonomy/definitions/${id}`)
      .then(response => {
        if (response) {
          //setTaxonomy(response.data[0].children);
          addChildren(
            id,
            response.data.children.map((d: any) => {
              return {id: d.uuid, value: d.uuid, title: d.name, children: d.children};
            }),
          );
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

  const addChildren = (parentUuid: string, children: any[]) => {
    if (!taxonomy) return;
    const newTax = [...taxonomy];
    const parentIndex = taxonomy?.findIndex(t => t.uuid == parentUuid);
    newTax[parentIndex].children = children;
    console.log(parentUuid, children, {parentIndex});
    setTaxonomy(newTax);
  };

  const onSelected = (newValue: string) => {
    console.log(newValue);
  };
  return (
    <TreeSelect
      treeDataSimpleMode
      style={{width: '100%'}}
      value={value}
      placeholder="Seleciona una categoría"
      loadData={onLoadData}
      {...props}
      treeData={taxonomy?.map(d => {
        return {id: d.uuid, value: d.uuid, title: d.name, children: d.children};
      })}
    />
  );
};

export default TaxonomySelector;
