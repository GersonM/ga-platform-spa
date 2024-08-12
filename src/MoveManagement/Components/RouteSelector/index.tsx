import React, {useEffect, useState} from 'react';
import {Select} from 'antd';
import axios from 'axios';
import {MoveLocation, MoveRoute} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface RouteSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  style?: React.CSSProperties;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const RouteSelector = ({placeholder, mode, ...props}: RouteSelectorProps) => {
  const [routes, setRoutes] = useState<MoveRoute | any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/routes`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setRoutes(
            response.data.map((item: MoveLocation) => {
              return {value: item.uuid, label: `${item.name}`};
            }),
          );
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige una ruta'}
      showSearch={true}
      optionFilterProp={'label'}
      loading={loading}
      options={routes}
      mode={mode || undefined}
    />
  );
};

export default RouteSelector;
