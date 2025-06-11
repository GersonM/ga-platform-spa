import {type CSSProperties, useEffect, useState} from 'react';
import {Select} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';
import type {MoveLocation, StorageProduct} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface ProductSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  style?: CSSProperties;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ProductSelector = ({placeholder, mode, style, ...props}: ProductSelectorProps) => {
  const [products, setProducts] = useState<StorageProduct[]>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const lastSearchText = useDebounce(name, 300);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        search: lastSearchText,
      },
    };

    axios
      .get(`warehouses/products`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setProducts(
            response.data.data.map((item: MoveLocation) => {
              return {value: item.uuid, label: `${item.name}`, entity: item};
            }),
          );
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, lastSearchText]);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Selecciona una ubicación'}
      showSearch={true}
      onSearch={value => setName(value)}
      filterOption={false}
      loading={loading}
      style={style ? style : {width: '100%'}}
      options={products}
      mode={mode}
      optionRender={option => {
        console.log({option});
        return <div>
          {option.label}
          <br/>
          {/* @ts-ignore */}
          <small>{option?.data.entity?.code}</small>
        </div>;
      }
      }
    />
  );
};

export default ProductSelector;
