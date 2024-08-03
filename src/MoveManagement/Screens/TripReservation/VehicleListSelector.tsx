import React, {useEffect, useState} from 'react';
import axios from 'axios';

import {MoveVehicle} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import './styles.less';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import {Tag} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface VehicleListSelectorProps {
  onChange?: (vehicle: MoveVehicle) => void;
}

const VehicleListSelector = ({onChange}: VehicleListSelectorProps) => {
  const [vehicles, setVehicles] = useState<MoveVehicle | any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MoveVehicle>();

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
          setVehicles(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <div>
      <LoadingIndicator visible={loading} />
      <ul className={'vehicle-list'}>
        {vehicles.map((item: MoveVehicle) => {
          return (
            <li
              key={item.uuid}
              className={`${selectedVehicle && selectedVehicle.uuid == item.uuid ? 'selected' : ''}`}
              onClick={() => {
                setSelectedVehicle(item);
                onChange && onChange(item);
              }}>
              <span className={'icon-bus'}></span>
              <div className={'vehicle-info'}>
                {item.brand}
                <br />
                <small>{item.max_capacity} pasajeros</small>
              </div>
              <Tag>{item.registration_plate}</Tag>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VehicleListSelector;
