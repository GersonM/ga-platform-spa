import {type CSSProperties, useEffect, useState} from 'react';
import {Select} from 'antd';
import {useDebounce} from '@uidotdev/usehooks';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {StorageProduct, StorageProductVariation} from '../../../Types/api';

interface ProductVariationSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  product?: StorageProduct;
  disabled?: boolean;
  value?: any;
  style?: CSSProperties;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ProductVariationSelector = ({placeholder, mode, style, ...props}: ProductVariationSelectorProps) => {
  const [variations, setVariations] = useState<StorageProductVariation[]>();
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
      .get(`warehouses/variations`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setVariations(
            response.data.data.map((item: StorageProductVariation) => {
              return {value: item.uuid, label: `${item.variation_name}`, entity: item};
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
      options={variations}
      mode={mode}
      optionRender={option => {
        return <div>
          {option.label}
          <br/>
          {/* @ts-ignore */}
          <small>{option?.data.entity?.product.name}</small>
        </div>;
      }
      }
    />
  );
};

export default ProductVariationSelector;
