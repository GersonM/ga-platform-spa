import {useEffect, useState} from 'react';
import axios from 'axios';
import {PiCarProfile} from 'react-icons/pi';
import {Dayjs} from 'dayjs';
import {Empty, Tag} from 'antd';

import type {MoveVehicle} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import Config from '../../../Config';
import './styles.less';

interface VehicleListSelectorProps {
  _value?: string;
  departureTime?: Dayjs|null;
  arrivalTime?: Dayjs|null;
  onChange?: (value: string, vehicle: MoveVehicle) => void;
}

const VehicleListSelector = ({onChange, departureTime, arrivalTime, _value}: VehicleListSelectorProps) => {
  const [vehicles, setVehicles] = useState<MoveVehicle | any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MoveVehicle>();

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        departure_time: departureTime?.format(Config.datetimeFormatServer),
        arrival_time: arrivalTime?.format(Config.datetimeFormatServer),
      },
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
  }, [arrivalTime, departureTime]);

  return (
    <div>
      <LoadingIndicator visible={loading} />
      {vehicles && vehicles.length == 0 && (
        <Empty description={'No hay vehículos disponibles'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <ul className={'vehicle-list'}>
        {vehicles.map((vehicle: MoveVehicle) => {
          return (
            <li
              key={vehicle.uuid}
              className={`${selectedVehicle && selectedVehicle.uuid == vehicle.uuid ? 'selected' : ''}`}
              onClick={() => {
                setSelectedVehicle(vehicle);
                if (onChange) {
                  onChange(vehicle.uuid, vehicle);
                }
              }}>
              <PiCarProfile className={'icon'} />
              <div className={'vehicle-info'}>
                {vehicle.brand} {vehicle.model} {vehicle.color}
                <br />
                <small>
                  {vehicle.type} {vehicle.max_capacity} pasajeros
                </small>
              </div>
              <div>
                <Tag>{vehicle.registration_plate}</Tag> <br />
                <Tag color={'blue'}>{vehicle.circulation_card || 'Sin tarjeta'}</Tag>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VehicleListSelector;
