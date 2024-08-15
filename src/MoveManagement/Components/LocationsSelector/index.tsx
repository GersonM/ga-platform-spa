import React, {useEffect, useRef, useState} from 'react';
import {Button, Divider, Input, InputRef, Select, Space, Tooltip} from 'antd';
import axios from 'axios';
import {MoveLocation} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {PlusIcon} from '@heroicons/react/24/solid';
import IconButton from '../../../CommonUI/IconButton';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {useDebounce} from '@uidotdev/usehooks';

interface LocationsSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const LocationsSelector = ({placeholder, mode, ...props}: LocationsSelectorProps) => {
  const [locations, setLocations] = useState<MoveLocation | any>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const lastSearchText = useDebounce(name, 300);
  const inputRef = useRef<InputRef>(null);
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
      .get(`move/locations`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setLocations(
            response.data.map((item: MoveLocation) => {
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

  const addItem = () => {
    setLoading(true);
    axios
      .post('move/locations', {name, address: name})
      .then(() => {
        setLoading(false);
        setReload(!reload);
      })
      .catch(error => {
        setLoading(false);
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Selecciona una ubicación'}
      showSearch={true}
      onSearch={value => setName(value)}
      filterOption={false}
      loading={loading}
      options={locations}
      mode={mode}
      optionRender={option => (
        <div>
          {option.label}
          <br />
          <small>{option.data.entity.address}</small>
        </div>
      )}
      dropdownRender={menu => (
        <>
          {menu}
          {name.length > 2 && (
            <>
              <Tooltip title={'Agregar'}>
                <PrimaryButton block icon={<PlusIcon />} onClick={addItem} label={'Crear "' + name + '"'} />
              </Tooltip>
            </>
          )}
        </>
      )}
    />
  );
};

export default LocationsSelector;
