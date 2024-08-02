import {useEffect, useState} from 'react';
import {Select} from 'antd';
import axios from 'axios';
import {MoveVehicle} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface VehicleSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  value?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const VehicleSelector = ({placeholder, mode, ...props}: VehicleSelectorProps) => {
  const [locations, setLocations] = useState<MoveVehicle | any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`move/vehicles`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setLocations(
            response.data.map((item: MoveVehicle) => {
              return {value: item.uuid, label: `${item.registration_plate} - ${item.brand}`};
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
      placeholder={placeholder || 'Elige un persona'}
      showSearch={true}
      optionFilterProp={'label'}
      loading={loading}
      options={locations}
      mode={mode || undefined}
    />
  );
};

export default VehicleSelector;
