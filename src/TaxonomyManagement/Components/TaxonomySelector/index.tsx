import {useEffect, useState} from 'react';
import {TreeSelect} from 'antd';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {TaxonomyDefinition} from '../../../Types/api';

interface ITaxonomySelectorProps {
  value?: any;
  code?: string;
  property?: string;
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
}

const TaxonomySelector = ({code, property = 'uuid', onChange, ...props}: ITaxonomySelectorProps) => {
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
        if (response.data[0]) {

          setTaxonomy(response.data[0].children.map((c: any) => ({
            title: c.name,
            id: c[property],
            value: c[property],
            entity: c,
            children: c.children?.map((sC: any) => ({
              title: sC.name,
              id: sC[property],
              value: sC[property],
              entity: sC,
              children: sC.children?.map((ssC: any) => ({
                title: ssC.name,
                id: ssC[property],
                value: ssC[property],
                entity: ssC,
                children: ssC.children?.map((sssC: any) => ({
                  title: sssC.name,
                  id: sssC[property],
                  value: sssC[property],
                  entity: sssC,
                })),
              })),
            })),
          })));
        }

      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <TreeSelect
      treeDataSimpleMode
      style={{width: '100%'}}
      allowClear
      placeholder="Seleciona una categoría"
      onSelect={(v: string, option: any) => {
        console.log('VVVVV', v);
        if (onChange) {
          let nV: string = v;
          if (property !== 'uuid') {
            nV = option.entity[property];
          }
          onChange(nV, option);
        }
      }}
      {...props}
      treeData={taxonomy}
    />
  );
};

export default TaxonomySelector;
