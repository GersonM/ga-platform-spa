import {useEffect, useState} from 'react';
import {PiBuildings, PiCallBellDuotone, PiCarProfile, PiHardHatDuotone, PiOvenDuotone} from 'react-icons/pi';
import {Dayjs} from 'dayjs';
import {Empty, Tag} from 'antd';
import axios from 'axios';

import type {MoveVehicle} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import Config from '../../../Config';
import './styles.less';

interface VehicleListSelectorProps {
  value?: string;
  departureTime?: Dayjs;
  arrivalTime?: Dayjs;
  onChange?: (value: string, vehicle: MoveVehicle) => void;
}

const VehicleListSelector = ({onChange, departureTime, arrivalTime}: VehicleListSelectorProps) => {
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

  const getIcon = (path?: string) => {
    path = path?.toLowerCase();
    switch (path) {
      case 'team':
        return <PiHardHatDuotone className={'icon'} />;
      case 'space':
        return <PiBuildings className={'icon'} />;
      case 'kitchen':
        return <PiOvenDuotone className={'icon'} />;
      case 'vehicle':
        return <PiCarProfile className={'icon'} />;
      default:
        return <PiCallBellDuotone className={'icon'} />;
    }
  };

  return (
    <>
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
                onChange && onChange(vehicle.uuid, vehicle);
              }}>
              {getIcon(vehicle.type)}
              <div className={'vehicle-info'}>
                {vehicle.registration_plate} - {vehicle.model} {vehicle.color}
                <br />
                <small>
                  {vehicle.brand} : {vehicle.type}: Max. {vehicle.max_capacity} personas
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
    </>
  );
};

export default VehicleListSelector;
