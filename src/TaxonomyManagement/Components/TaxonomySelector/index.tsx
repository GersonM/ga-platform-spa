import {useEffect, useState} from 'react';
import {TreeSelect, type TreeSelectProps} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {TaxonomyDefinition} from '../../../Types/api';

interface ITaxonomySelectorProps {
  value?: any;
  code?: string;
  property?: string;
  onChange?: (value: any, option: any) => void;
}

const TaxonomySelector = ({code, property = 'uuid', value, ...props}: ITaxonomySelectorProps) => {
  const [taxonomy, setTaxonomy] = useState<TaxonomyDefinition[]>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        code: code,
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

  return (
    <TreeSelect
      treeDataSimpleMode
      style={{width: '100%'}}
      value={value}
      placeholder="Seleciona una categoría"
      loadData={onLoadData}
      onSelect={(v: string, option: any) => {
        if (props.onChange) {
          let value: string = v;
          if (property !== 'uuid') {
            value = option[property];
          }
          props.onChange(value, option);
        }
      }}
      {...props}
      treeData={taxonomy?.map(d => {
        return {id: d.uuid, value: d.uuid, title: d.name, children: d.children};
      })}
    />
  );
};

export default TaxonomySelector;
